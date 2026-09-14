import asyncio
import json
import re
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.api_v1.msg.catalog import Catalog, CatalogCache, FALLBACKS, substitute
from backend.api_v1.lang.lang_schema import LangRead


class TranslationContractTests(unittest.TestCase):
    def test_every_key_has_both_languages_and_matching_parameters(self):
        self.assertGreater(len(FALLBACKS), 250)
        for key, values in FALLBACKS.items():
            with self.subTest(key=key):
                self.assertEqual(set(values), {"eng", "rus"})
                self.assertTrue(values["eng"] and values["rus"])
                self.assertEqual(set(re.findall(r"\$\{(\w+)\}", values["eng"])),
                                 set(re.findall(r"\$\{(\w+)\}", values["rus"])))

    def test_frontend_fallback_matches_seed(self):
        root = Path(__file__).resolve().parents[2]
        self.assertEqual(json.loads((root / "frontend/src/i18n/ui.json").read_text(encoding="utf-8")),
                         json.loads((root / "backend/backend/api_v1/msg/ui.json").read_text(encoding="utf-8")))

    def test_dynamic_ids_db_override_and_fallback(self):
        catalog = Catalog(languages={
            41: LangRead(id=41, short_name="eng", name="English", locale="en"),
            93: LangRead(id=93, short_name="rus", name="Русский", locale="ru"),
        }, messages={41: {"custom": "English fallback"}, 93: {"save": "Записать"}})
        self.assertEqual(catalog.default_id, 41)
        self.assertEqual(catalog.text("save", 93), "Записать")
        self.assertEqual(catalog.text("categoryNotFound", 93, {"id": 17}), "Категория с ID 17 не найдена")
        self.assertEqual(catalog.text("custom", 93), "English fallback")
        self.assertEqual(catalog.text("unknown", 93, {"id": 4}, "Record ${id}"), "Record 4")

    def test_substitution_is_single_pass_and_preserves_missing_params(self):
        self.assertEqual(substitute("${name} / ${id}", {"name": "${id}", "id": 0}), "${id} / 0")
        self.assertEqual(substitute("${missing}", {}), "${missing}")

    def test_db_failure_preserves_cached_catalog(self):
        async def check():
            cache = CatalogCache()
            cache.snapshot = Catalog(version="last-good")
            with patch("backend.database.db_helper.db_helper.session_factory", side_effect=OSError("offline")):
                with self.assertLogs("backend.api_v1.msg.catalog", level="ERROR"):
                    result = await cache.get(force=True)
            self.assertEqual(result.version, "last-good")
        asyncio.run(check())
