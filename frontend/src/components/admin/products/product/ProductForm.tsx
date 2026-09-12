import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Product, ProductCreate, ProductUpdate, MutationResponse } from './productApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';
import { AsyncAutocomplete, type AsyncOption } from '../../nomenclature/_shared/AsyncAutocomplete';
import { fetchMarkets } from '../../nomenclature/market/marketApi';
import { fetchSegments } from '../../nomenclature/segment/segmentApi';
import { fetchCategories } from '../../nomenclature/category/categoryApi';
import { fetchFamilies } from '../../nomenclature/family/familyApi';
import { fetchNomenclatures } from '../../nomenclature/nomenclature/nomenclatureApi';
import { fetchProductStatuses } from '../product_statuses/productStatusApi';
import { fetchImportCodes } from '../import_codes/importCodeApi';
import { fetchProductTypes } from '../product_types/productTypeApi';

const NONE = 0;

const schema = z.object({
    code: z.string().min(1, 'required').max(16, 'max_length'),
    name: z.string().max(128, 'max_length'),
    market_id: z.number(),
    segment_id: z.number(),
    category_id: z.number(),
    family_id: z.number(),
    status_id: z.number(),
    import_code_id: z.number(),
    product_type_id: z.number(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    editing: Product | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Product>, Error, ProductCreate>;
    updateMutation: UseMutationResult<MutationResponse<Product>, Error, { id: number; data: ProductUpdate }>;
}

export function ProductForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: catalogStrings });
    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
        defaultValues: { code: '', name: '', market_id: 0, segment_id: 0, category_id: 0, family_id: 0, status_id: 0, import_code_id: 0, product_type_id: 0 },
    });

    const marketId = watch('market_id');
    const segmentId = watch('segment_id');
    const categoryId = watch('category_id');

    const { data: markets = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = [] } = useQuery({ queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId });
    const { data: categories = [] } = useQuery({ queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId });
    const { data: families = [] } = useQuery({ queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId });
    const { data: nomenclatures = [] } = useQuery({ queryKey: ['nomenclatures_all'], queryFn: fetchNomenclatures, staleTime: Infinity });
    const { data: statuses = [] } = useQuery({ queryKey: ['product_statuses'], queryFn: fetchProductStatuses, staleTime: Infinity });
    const { data: importCodes = [] } = useQuery({ queryKey: ['import_codes'], queryFn: fetchImportCodes, staleTime: Infinity });
    const { data: productTypes = [] } = useQuery({ queryKey: ['product_types'], queryFn: fetchProductTypes, staleTime: Infinity });

    const nomById = useMemo(() => new Map(nomenclatures.map((n) => [n.id, n])), [nomenclatures]);
    const nomByTuple = useMemo(
        () => new Map(nomenclatures.map((n) => [`${n.market_id}|${n.segment_id}|${n.category_id}|${n.family_id}`, n.id])),
        [nomenclatures],
    );
    const importCodeLabel = useMemo(
        () => new Map(importCodes.map((c) => [c.id, c.description ? `${c.code} — ${c.description}` : c.code])),
        [importCodes],
    );

    const searchImportCodes = async (q: string): Promise<AsyncOption[]> => {
        const needle = q.trim().toLowerCase();
        return importCodes
            .filter((c) => c.code.toLowerCase().includes(needle) || (c.description ?? '').toLowerCase().includes(needle))
            .slice(0, 50)
            .map((c) => ({ id: c.id, label: c.description ? `${c.code} — ${c.description}` : c.code }));
    };

    useEffect(() => {
        const nom = editing?.nomenclature_id ? nomById.get(editing.nomenclature_id) : undefined;
        reset({
            code: editing?.code ?? '',
            name: editing?.name ?? '',
            market_id: nom?.market_id ?? 0,
            segment_id: nom?.segment_id ?? 0,
            category_id: nom?.category_id ?? 0,
            family_id: nom?.family_id ?? 0,
            status_id: editing?.status_id ?? 0,
            import_code_id: editing?.import_code_id ?? 0,
            product_type_id: editing?.product_type_id ?? 0,
        });
    }, [editing, open, reset, nomById]);

    const resolveNomenclatureId = (v: FormValues): number | null => {
        if (!v.market_id || !v.segment_id || !v.category_id || !v.family_id) return null;
        return nomByTuple.get(`${v.market_id}|${v.segment_id}|${v.category_id}|${v.family_id}`) ?? null;
    };

    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        const payload: ProductCreate = {
            code: values.code,
            name: values.name || null,
            nomenclature_id: resolveNomenclatureId(values),
            status_id: values.status_id || null,
            import_code_id: values.import_code_id || null,
            product_type_id: values.product_type_id || null,
        };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload);
    };

    const select = (name: keyof FormValues, labelKey: string, options: { id: number; label: string }[], disabled = false, onChange?: (v: number) => void) => (
        <Controller name={name} control={control} render={({ field }) => (
            <TextField select label={cfl(getString(labelKey)) || labelKey} fullWidth size="small"
                {...field} value={field.value ?? 0} disabled={disabled}
                onChange={(e) => { const v = Number(e.target.value); field.onChange(v); onChange?.(v); }}>
                <MenuItem value={NONE}>{getString('any')}</MenuItem>
                {options.map((o) => <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>)}
            </TextField>
        )} />
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {cfl(getString(editing ? 'edit' : 'create'))} — {getString('product')}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Controller name="code" control={control} render={({ field }) => (
                            <TextField label={cfl(getString('productCode')) || 'code'} fullWidth size="small" {...field}
                                error={!!errors.code} helperText={errors.code?.message ? getString(errors.code.message) : undefined}
                                slotProps={{ htmlInput: { maxLength: 16 } }} />
                        )} />
                        <Controller name="name" control={control} render={({ field }) => (
                            <TextField label={cfl(getString('productName')) || 'name'} fullWidth size="small" {...field}
                                error={!!errors.name} helperText={errors.name?.message ? getString(errors.name.message) : undefined}
                                slotProps={{ htmlInput: { maxLength: 128 } }} />
                        )} />

                        {select('market_id', 'market', markets.map((m) => ({ id: m.id, label: m.name })), false,
                            () => reset((p) => ({ ...p, segment_id: 0, category_id: 0, family_id: 0 })))}
                        {select('segment_id', 'segment', segments.map((s) => ({ id: s.id, label: s.name })), !marketId,
                            () => reset((p) => ({ ...p, category_id: 0, family_id: 0 })))}
                        {select('category_id', 'category', categories.map((c) => ({ id: c.id, label: c.name })), !segmentId,
                            () => reset((p) => ({ ...p, family_id: 0 })))}
                        {select('family_id', 'family', families.map((f) => ({ id: f.id, label: f.name })), !categoryId)}
                        {select('status_id', 'productStatus', statuses.map((s) => ({ id: s.id, label: s.name || s.code })))}
                        {select('product_type_id', 'productType', productTypes.map((t) => ({ id: t.id, label: t.name || t.code })))}

                        <Controller name="import_code_id" control={control} render={({ field }) => (
                            <AsyncAutocomplete
                                label={cfl(getString('importCode')) || 'import code'}
                                valueId={field.value || null}
                                valueLabel={field.value ? importCodeLabel.get(field.value) ?? null : null}
                                onChange={(o) => field.onChange(o?.id ?? 0)}
                                search={searchImportCodes}
                                placeholder={getString('search')}
                            />
                        )} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onClose} disabled={pending}>{getString('cancel')}</Button>
                    <Button variant="contained" type="submit" disabled={pending}
                        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                        {getString(editing ? 'save' : 'create')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
