import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, IconButton, InputAdornment, MenuItem, Paper, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';
import { AsyncAutocomplete, type AsyncOption } from '../../nomenclature/_shared/AsyncAutocomplete';
import { fetchMarkets } from '../../nomenclature/market/marketApi';
import { fetchSegments } from '../../nomenclature/segment/segmentApi';
import { fetchCategories } from '../../nomenclature/category/categoryApi';
import { fetchFamilies } from '../../nomenclature/family/familyApi';
import { fetchProductStatuses } from '../product_statuses/productStatusApi';
import { fetchImportCodes } from '../import_codes/importCodeApi';
import { fetchProductTypes } from '../product_types/productTypeApi';
import { fetchSuppliers } from '../../suppliers/supplier/supplierApi';
import type { ProductListParams } from './productApi';

const NONE = 0;

interface Props {
    onChange: (filters: ProductListParams) => void;
}

export function ProductFilters({ onChange }: Props) {
    const getString = useString({ str: catalogStrings });
    const [marketId, setMarketId] = useState(NONE);
    const [segmentId, setSegmentId] = useState(NONE);
    const [categoryId, setCategoryId] = useState(NONE);
    const [familyId, setFamilyId] = useState(NONE);
    const [statusId, setStatusId] = useState(NONE);
    const [importCodeId, setImportCodeId] = useState(NONE);
    const [productTypeId, setProductTypeId] = useState(NONE);
    const [supplierId, setSupplierId] = useState(NONE);
    const [supplierLabel, setSupplierLabel] = useState<string | null>(null);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [ean, setEan] = useState('');
    const [debouncedEan, setDebouncedEan] = useState('');

    const { data: markets = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = [] } = useQuery({ queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId });
    const { data: categories = [] } = useQuery({ queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId });
    const { data: families = [] } = useQuery({ queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId });
    const { data: statuses = [] } = useQuery({ queryKey: ['product_statuses'], queryFn: fetchProductStatuses, staleTime: Infinity });
    const { data: importCodes = [] } = useQuery({ queryKey: ['import_codes'], queryFn: fetchImportCodes, staleTime: Infinity });
    const { data: productTypes = [] } = useQuery({ queryKey: ['product_types'], queryFn: fetchProductTypes, staleTime: Infinity });

    const importCodeLabel = useMemo(
        () => new Map(importCodes.map((c) => [c.id, c.description ? `${c.code} — ${c.description}` : c.code])),
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
            supplier_id: supplierId || undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQ, debouncedEan, marketId, segmentId, categoryId, familyId, statusId, importCodeId, productTypeId, supplierId]);

    const reset = () => {
        setMarketId(NONE); setSegmentId(NONE); setCategoryId(NONE); setFamilyId(NONE);
        setStatusId(NONE); setImportCodeId(NONE); setProductTypeId(NONE);
        setSupplierId(NONE); setSupplierLabel(null); setQ(''); setEan('');
    };

    const select = (labelKey: string, value: number, disabled: boolean, options: { id: number; label: string }[], onChange: (v: number) => void) => (
        <TextField select size="small" label={cfl(getString(labelKey)) || labelKey} sx={{ minWidth: 160, flex: 1 }}
            value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))}>
            <MenuItem value={NONE}>{getString('any')}</MenuItem>
            {options.map((o) => <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>)}
        </TextField>
    );

    const searchImportCodes = async (query: string): Promise<AsyncOption[]> => {
        const needle = query.trim().toLowerCase();
        return importCodes
            .filter((c) => c.code.toLowerCase().includes(needle) || (c.description ?? '').toLowerCase().includes(needle))
            .slice(0, 50)
            .map((c) => ({ id: c.id, label: c.description ? `${c.code} — ${c.description}` : c.code }));
    };

    const searchSuppliers = async (query: string): Promise<AsyncOption[]> => {
        const res = await fetchSuppliers({ q: query, page_size: 20 });
        return res.items.map((s) => ({ id: s.id, label: `${s.code} — ${s.name ?? ''}` }));
    };

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                <TextField size="small" label={cfl(getString('search')) || 'search'} sx={{ minWidth: 240, flex: 2 }}
                    value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder={`${getString('productCode')} / ${getString('productName')}`} />
                <TextField size="small" label={cfl(getString('searchByEan')) || 'EAN'} sx={{ minWidth: 200, flex: 1 }}
                    value={ean} onChange={(e) => setEan(e.target.value)}
                    placeholder={getString('ean')}
                    slotProps={{
                        input: {
                            endAdornment: ean ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setEan('')} edge="end"
                                        aria-label={getString('clear')}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }} />
                {select('status', statusId, false, statuses.map((s) => ({ id: s.id, label: s.name || s.code })), setStatusId)}
                {select('productType', productTypeId, false, productTypes.map((t) => ({ id: t.id, label: t.name || t.code })), setProductTypeId)}
                <AsyncAutocomplete
                    label={cfl(getString('importCode')) || 'import code'}
                    valueId={importCodeId || null}
                    valueLabel={importCodeId ? importCodeLabel.get(importCodeId) ?? null : null}
                    onChange={(o) => setImportCodeId(o?.id ?? NONE)}
                    search={searchImportCodes}
                    placeholder={getString('search')}
                    sx={{ minWidth: 220, flex: 1 }}
                />
                <AsyncAutocomplete
                    label={cfl(getString('supplier')) || 'supplier'}
                    valueId={supplierId || null}
                    valueLabel={supplierLabel}
                    onChange={(o) => { setSupplierId(o?.id ?? NONE); setSupplierLabel(o?.label ?? null); }}
                    search={searchSuppliers}
                    placeholder={getString('search')}
                    sx={{ minWidth: 220, flex: 1 }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {select('market', marketId, false, markets.map((m) => ({ id: m.id, label: m.name })), (v) => { setMarketId(v); setSegmentId(NONE); setCategoryId(NONE); setFamilyId(NONE); })}
                {select('segment', segmentId, !marketId, segments.map((s) => ({ id: s.id, label: s.name })), (v) => { setSegmentId(v); setCategoryId(NONE); setFamilyId(NONE); })}
                {select('category', categoryId, !segmentId, categories.map((c) => ({ id: c.id, label: c.name })), (v) => { setCategoryId(v); setFamilyId(NONE); })}
                {select('family', familyId, !categoryId, families.map((f) => ({ id: f.id, label: f.name })), setFamilyId)}
                <Button variant="text" onClick={reset} sx={{ flex: 0 }}>{getString('resetFilters')}</Button>
            </Box>
        </Paper>
    );
}
