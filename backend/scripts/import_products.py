"""Bulk-import products, suppliers and product-supplier links from the METI article CSV.

The CSV is large (~1M rows), so it is never loaded into memory: a single streaming
pass COPYs the needed columns into an UNLOGGED staging table, then set-based
INSERT ... SELECT statements populate the tables. Idempotent and re-runnable.

Usage (from backend/):
    poetry run python -m scripts.import_products
    poetry run python -m scripts.import_products --csv "C:\\...\\Article.csv" --truncate
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncpg  # noqa: E402

from backend.config.config import settings  # noqa: E402
from backend.database.init_db import init_db  # noqa: E402  (also registers all models)
from backend.database.db_helper import db_helper  # noqa: E402

DEFAULT_CSV = r"C:\Users\andre\Desktop\DataSamples\Article_METI_11.09.2026.csv"

# CSV column indexes (0-based) per the METI export header.
C = {
    "product_code": 0,          # Артикул
    "import_code": 1,           # УКТЗЕД
    "product_name": 2,          # Название арт.
    "market": 4,                # Рынок
    "segment": 5,               # Сегмент
    "category": 6,              # Категория
    "family": 7,                # Семья
    "supplier_code": 8,         # Основной пост-к
    "supplier_name": 9,         # Название поставщика
    "product_status": 11,       # Статус артикула
    "supplier_status": 12,      # Статус постащика
    "supplier_product_status": 13,  # Cт арт у пост
}

STAGING_COLUMNS = list(C.keys())


def _nn(value: str):
    return value if value not in (None, "") else None


def _record(row: list[str]) -> tuple:
    return tuple(_nn(row[C[name]]) for name in STAGING_COLUMNS)


def _rows(csv_path: str, encoding: str):
    with open(csv_path, encoding=encoding, newline="") as handle:
        reader = csv.reader(handle)
        next(reader, None)
        for row in reader:
            yield _record(row)


def _dsn() -> str:
    url = settings.db.url
    if not url.startswith("postgresql+asyncpg://"):
        raise SystemExit(f"import_products only supports postgresql+asyncpg (got '{url}')")
    return url.replace("postgresql+asyncpg://", "postgresql://", 1)


DDL = [
    # lookups
    "INSERT INTO product_status (code) SELECT DISTINCT product_status FROM staging_product_csv "
    "WHERE product_status IS NOT NULL ON CONFLICT (code) DO NOTHING;",
    "INSERT INTO supplier_status (code) SELECT DISTINCT supplier_status FROM staging_product_csv "
    "WHERE supplier_status IS NOT NULL ON CONFLICT (code) DO NOTHING;",
    "INSERT INTO supplier_product_status (code) SELECT DISTINCT supplier_product_status FROM staging_product_csv "
    "WHERE supplier_product_status IS NOT NULL ON CONFLICT (code) DO NOTHING;",
    "INSERT INTO import_code (code) SELECT DISTINCT import_code FROM staging_product_csv "
    "WHERE import_code IS NOT NULL ON CONFLICT (code) DO NOTHING;",
    # suppliers
    """
    INSERT INTO supplier (code, name, status_id)
    SELECT DISTINCT ON (st.supplier_code) st.supplier_code, st.supplier_name, ss.id
    FROM staging_product_csv st
    LEFT JOIN supplier_status ss ON ss.code = st.supplier_status
    WHERE st.supplier_code IS NOT NULL
    ORDER BY st.supplier_code
    ON CONFLICT (code) DO NOTHING;
    """,
    # products (nomenclature resolved through the full code chain)
    """
    INSERT INTO product (code, name, nomenclature_id, status_id, import_code_id)
    SELECT DISTINCT ON (st.product_code)
        st.product_code, st.product_name, n."Id", ps.id, ic.id
    FROM staging_product_csv st
    LEFT JOIN product_status ps ON ps.code = st.product_status
    LEFT JOIN import_code ic ON ic.code = st.import_code
    LEFT JOIN market mk ON mk."Id" = NULLIF(st.market, '')::int
    LEFT JOIN segment sg ON sg."IdMarket" = mk."Id" AND sg.segment = st.segment
    LEFT JOIN category c ON c."IdSegment" = sg."Id" AND c."CategoryCode" = st.category
    LEFT JOIN family f ON f."IdCategory" = c."Id" AND f."FamilyCode" = st.family
    LEFT JOIN nomenclature n
        ON n."IdMarket" = mk."Id" AND n."IdSegment" = sg."Id"
       AND n."IdCategory" = c."Id" AND n."IdFamily" = f."Id"
    WHERE st.product_code IS NOT NULL
    ORDER BY st.product_code
    ON CONFLICT (code) DO NOTHING;
    """,
    # associations
    """
    INSERT INTO product_supplier (product_id, supplier_id, status_id)
    SELECT DISTINCT p.id, s.id, sps.id
    FROM staging_product_csv st
    JOIN product p ON p.code = st.product_code
    JOIN supplier s ON s.code = st.supplier_code
    LEFT JOIN supplier_product_status sps ON sps.code = st.supplier_product_status
    ON CONFLICT (product_id, supplier_id) DO NOTHING;
    """,
    "DROP TABLE IF EXISTS staging_product_csv;",
    "ANALYZE product; ANALYZE supplier; ANALYZE product_supplier;",
    "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
    "CREATE INDEX IF NOT EXISTS ix_product_code_trgm ON product USING gin (code gin_trgm_ops);",
    "CREATE INDEX IF NOT EXISTS ix_product_name_trgm ON product USING gin (name gin_trgm_ops);",
]

TRUNCATE = (
    "TRUNCATE product_supplier, product, supplier, product_status, "
    "supplier_status, supplier_product_status, import_code RESTART IDENTITY CASCADE;"
)

COUNTS = [
    ("product_status", "SELECT count(*) FROM product_status"),
    ("supplier_status", "SELECT count(*) FROM supplier_status"),
    ("supplier_product_status", "SELECT count(*) FROM supplier_product_status"),
    ("import_code", "SELECT count(*) FROM import_code"),
    ("supplier", "SELECT count(*) FROM supplier"),
    ("product", "SELECT count(*) FROM product"),
    ("product_supplier", "SELECT count(*) FROM product_supplier"),
    ("products w/o nomenclature", "SELECT count(*) FROM product WHERE nomenclature_id IS NULL"),
]


async def run(csv_path: str, encoding: str, truncate: bool) -> None:
    if not os.path.exists(csv_path):
        raise SystemExit(f"CSV not found: {csv_path}")

    started = time.perf_counter()
    print("creating tables (idempotent) ...", flush=True)
    await init_db()
    await db_helper.dispose()

    conn = await asyncpg.connect(_dsn())
    try:
        await conn.execute("SET synchronous_commit = off;")
        if truncate:
            print("truncating target tables ...", flush=True)
            await conn.execute(TRUNCATE)

        print("staging CSV (single streaming pass) ...", flush=True)
        await conn.execute("DROP TABLE IF EXISTS staging_product_csv;")
        await conn.execute(
            "CREATE UNLOGGED TABLE staging_product_csv ("
            + ", ".join(f"{name} text" for name in STAGING_COLUMNS)
            + ");"
        )
        await conn.copy_records_to_table(
            "staging_product_csv", records=_rows(csv_path, encoding), columns=STAGING_COLUMNS
        )
        total = await conn.fetchval("SELECT count(*) FROM staging_product_csv")
        print(f"  staged rows: {total:,}", flush=True)

        for statement in DDL:
            label = " ".join(statement.split())[:60]
            print(f"  > {label} ...", flush=True)
            await conn.execute(statement)
    finally:
        await conn.close()

    print(f"done in {time.perf_counter() - started:0.1f}s", flush=True)

    conn = await asyncpg.connect(_dsn())
    try:
        for label, query in COUNTS:
            print(f"  {label}: {await conn.fetchval(query):,}")
    finally:
        await conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Bulk-import products/suppliers from the METI article CSV.")
    parser.add_argument("--csv", default=DEFAULT_CSV, help="Path to the source CSV.")
    parser.add_argument("--encoding", default="utf-8-sig", help="CSV encoding (default utf-8-sig).")
    parser.add_argument("--truncate", action="store_true", help="Empty target tables before importing.")
    args = parser.parse_args()
    asyncio.run(run(args.csv, args.encoding, args.truncate))


if __name__ == "__main__":
    main()
