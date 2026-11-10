import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Button } from '@ui/components/ui/button';
import { FilterBar, SearchField, SelectFilter } from '@ui/components/common/filters';
import { AsyncCombobox, type AsyncOption } from '@ui/components/common/AsyncCombobox';
import { entityLabel } from '@ui/components/common/Combobox';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchMarkets } from '../../nomenclature/market/marketApi';
import { fetchSegments } from '../../nomenclature/segment/segmentApi';
import { fetchCategories } from '../../nomenclature/category/categoryApi';
import { fetchFamilies } from '../../nomenclature/family/familyApi';
import { fetchProductStatuses } from '../product_statuses/productStatusApi';
import { fetchImportCodes } from '../import_codes/importCodeApi';
import { fetchProductTypes } from '../product_types/productTypeApi';
import { fetchSuppliers } from '../../suppliers/supplier/supplierApi';
import type { ProductListParams } from './productApi';
import { EMPTY } from '@ui/utils/empty';

const NONE = 0;

interface Props {
    onChange: (filters: ProductListParams) => void;
}

/** Text filters are debounced; every change reports the whole filter set. */
export function ProductFilters({ onChange }: Props) {
    const getString = useString({ str: catalogStrings });
    const [marketId, setMarketId] = useState(NONE);
    const [segmentId, setSegmentId] = useState(NONE);
    const [categoryId, setCategoryId] = useState(NONE);
    const [familyId, setFamilyId] = useState(NONE);
    const [statusId, setStatusId] = useState(NONE);
    const [importCodeId, setImportCodeId] = useState(NONE);
    const [productTypeId, setProductTypeId] = useState(NONE);
    const [supplier, setSupplier] = useState<AsyncOption | null>(null);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [ean, setEan] = useState('');
    const [debouncedEan, setDebouncedEan] = useState('');

    const { data: markets = EMPTY } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = EMPTY } = useQuery({ queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId });
    const { data: categories = EMPTY } = useQuery({ queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId });
    const { data: families = EMPTY } = useQuery({ queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId });
    const { data: statuses = EMPTY } = useQuery({ queryKey: ['product_statuses'], queryFn: fetchProductStatuses, staleTime: Infinity });
    const { data: importCodes = EMPTY } = useQuery({ queryKey: ['import_codes'], queryFn: fetchImportCodes, staleTime: Infinity });
    const { data: productTypes = EMPTY } = useQuery({ queryKey: ['product_types'], queryFn: fetchProductTypes, staleTime: Infinity });

    const importCodeOptions = useMemo(
        () => importCodes.map((c) => ({ id: c.id, label: c.description ? `${c.code} — ${c.description}` : c.code })),
        [importCodes],
    );

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(q), 400);
        return () => clearTimeout(timer);
    }, [q]);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedEan(ean), 400);
        return () => clearTimeout(timer);
    }, [ean]);

    useEffect(() => {
        onChange({
            q: debouncedQ || undefined,
            ean: debouncedEan || undefined,
            market_id: marketId || undefined,
            segment_id: segmentId || undefined,
            category_id: categoryId || undefined,
            family_id: familyId || undefined,
            status_id: statusId || undefined,
            import_code_id: importCodeId || undefined,
            product_type_id: productTypeId || undefined,
            supplier_id: supplier?.id || undefined,
        });
        // onChange is the parent's setter wrapper; reporting on filter changes only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQ, debouncedEan, marketId, segmentId, categoryId, familyId, statusId, importCodeId, productTypeId, supplier]);

    const reset = () => {
        setMarketId(NONE); setSegmentId(NONE); setCategoryId(NONE); setFamilyId(NONE);
        setStatusId(NONE); setImportCodeId(NONE); setProductTypeId(NONE);
        setSupplier(null); setQ(''); setEan('');
    };

    const searchImportCodes = async (query: string): Promise<AsyncOption[]> => {
        const needle = query.trim().toLowerCase();
        return importCodeOptions.filter((o) => o.label.toLowerCase().includes(needle)).slice(0, 50);
    };
    const searchSuppliers = async (query: string): Promise<AsyncOption[]> => {
        const res = await fetchSuppliers({ q: query, page_size: 20 });
        return res.items.map((s) => ({ id: s.id, label: `${s.code} — ${s.name ?? ''}` }));
    };

    const any = getString('any');
    return (
        <FilterBar>
            <SearchField className="flex-[2]" label={cfl(getString('search'))} value={q} onChange={setQ}
                placeholder={`${getString('productCode')} / ${getString('productName')}`} />
            <SearchField className="min-w-[180px] flex-1" label={cfl(getString('searchByEan'))} value={ean} onChange={setEan}
                placeholder={getString('ean')} />
            <SelectFilter className="flex-1" label={cfl(getString('status'))} value={statusId} anyLabel={any}
                options={statuses.map((s) => ({ id: s.id, label: s.name || s.code }))} onChange={setStatusId} />
            <SelectFilter className="flex-1" label={cfl(getString('productType'))} value={productTypeId} anyLabel={any}
                options={productTypes.map((t) => ({ id: t.id, label: t.name || t.code }))} onChange={setProductTypeId} />
            <AsyncCombobox className="min-w-[200px] flex-1" label={cfl(getString('importCode'))}
                valueId={importCodeId || null}
                valueLabel={importCodeOptions.find((o) => o.id === importCodeId)?.label ?? null}
                onChange={(o) => setImportCodeId(o?.id ?? NONE)} search={searchImportCodes} placeholder={getString('search')} />
            <AsyncCombobox className="min-w-[200px] flex-1" label={cfl(getString('supplier'))}
                valueId={supplier?.id ?? null} valueLabel={supplier?.label ?? null}
                onChange={setSupplier} search={searchSuppliers} placeholder={getString('search')} />

            {/* second row: the nomenclature cascade */}
            <div className="basis-full" aria-hidden />
            <SelectFilter className="flex-1" label={cfl(getString('market'))} value={marketId} anyLabel={any}
                options={markets.map((m) => ({ id: m.id, label: m.name }))}
                onChange={(v) => { setMarketId(v); setSegmentId(NONE); setCategoryId(NONE); setFamilyId(NONE); }} />
            <SelectFilter className="flex-1" label={cfl(getString('segment'))} value={segmentId} anyLabel={any} disabled={!marketId}
                options={segments.map((s) => ({ id: s.id, label: entityLabel(s) }))}
                onChange={(v) => { setSegmentId(v); setCategoryId(NONE); setFamilyId(NONE); }} />
            <SelectFilter className="flex-1" label={cfl(getString('category'))} value={categoryId} anyLabel={any} disabled={!segmentId}
                options={categories.map((c) => ({ id: c.id, label: entityLabel(c) }))}
                onChange={(v) => { setCategoryId(v); setFamilyId(NONE); }} />
            <SelectFilter className="flex-1" label={cfl(getString('family'))} value={familyId} anyLabel={any} disabled={!categoryId}
                options={families.map((f) => ({ id: f.id, label: entityLabel(f) }))} onChange={setFamilyId} />
            <Button variant="ghost" onClick={reset}>
                <RotateCcw />{getString('resetFilters')}
            </Button>
        </FilterBar>
    );
}
