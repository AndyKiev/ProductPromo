import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Input } from '@ui/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@ui/components/ui/dialog';
import { FormDialog, FormField } from '@ui/components/common/FormDialog';
import { Combobox, NONE_ID } from '@ui/components/common/Combobox';
import { AsyncCombobox, type AsyncOption } from '@ui/components/common/AsyncCombobox';
import type { Product, ProductCreate, ProductUpdate, MutationResponse } from './productApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchMarkets } from '../../nomenclature/market/marketApi';
import { fetchSegments } from '../../nomenclature/segment/segmentApi';
import { fetchCategories } from '../../nomenclature/category/categoryApi';
import { fetchFamilies } from '../../nomenclature/family/familyApi';
import { fetchNomenclatures, type Nomenclature } from '../../nomenclature/nomenclature/nomenclatureApi';
import { fetchProductStatuses } from '../product_statuses/productStatusApi';
import { fetchImportCodes } from '../import_codes/importCodeApi';
import { fetchProductTypes } from '../product_types/productTypeApi';
import { EMPTY } from '@ui/utils/empty';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    // Numeric by contract (the catalog indexes code::integer): digits only, fits int4.
    code: z.string().trim().min(1, 'required').regex(/^\d{1,9}$/, 'digitsOnly'),
    name: z.string().trim().max(128, 'max_length'),
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
    editing: Product | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Product>, Error, ProductCreate>;
    updateMutation: UseMutationResult<MutationResponse<Product>, Error, { id: number; data: ProductUpdate }>;
}

const tupleKey = (m: number, s: number, c: number, f: number) => `${m}|${s}|${c}|${f}`;

/**
 * Mounted fresh per open by the parent (key). The nomenclature links are needed to fill the
 * market → family cascade of an edited product, so the form body waits for them.
 */
export function ProductForm(props: Props) {
    const getString = useString({ str: catalogStrings });
    const { data: nomenclatures } = useQuery({ queryKey: ['nomenclatures_all'], queryFn: fetchNomenclatures, staleTime: Infinity });
    if (!nomenclatures) {
        return (
            <Dialog open onOpenChange={(o) => !o && props.onClose()}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle className="sr-only">{getString('loading')}</DialogTitle>
                    <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" aria-label={getString('loading')} /></div>
                </DialogContent>
            </Dialog>
        );
    }
    return <ProductFormBody {...props} nomenclatures={nomenclatures} />;
}

function ProductFormBody({ editing, onClose, createMutation, updateMutation, nomenclatures }: Props & { nomenclatures: Nomenclature[] }) {
    const getString = useString({ str: catalogStrings });
    const nomByTuple = useMemo(
        () => new Map(nomenclatures.map((n) => [tupleKey(n.market_id, n.segment_id, n.category_id, n.family_id), n.id])),
        [nomenclatures],
    );
    const nom = editing?.nomenclature_id ? nomenclatures.find((n) => n.id === editing.nomenclature_id) : undefined;

    const { register, control, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: editing?.code ?? '',
            name: editing?.name ?? '',
            market_id: nom?.market_id ?? NONE_ID,
            segment_id: nom?.segment_id ?? NONE_ID,
            category_id: nom?.category_id ?? NONE_ID,
            family_id: nom?.family_id ?? NONE_ID,
            status_id: editing?.status_id ?? NONE_ID,
            import_code_id: editing?.import_code_id ?? NONE_ID,
            product_type_id: editing?.product_type_id ?? NONE_ID,
        },
    });
    const [marketId, segmentId, categoryId] = useWatch({ control, name: ['market_id', 'segment_id', 'category_id'] });

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
    const searchImportCodes = async (q: string): Promise<AsyncOption[]> => {
        const needle = q.trim().toLowerCase();
        return importCodeOptions.filter((o) => o.label.toLowerCase().includes(needle)).slice(0, 50);
    };

    // Changing a level clears the levels below it.
    const clearBelow = (...fields: ('segment_id' | 'category_id' | 'family_id')[]) =>
        fields.forEach((f) => setValue(f, NONE_ID, { shouldDirty: true }));

    const pending = createMutation.isPending || updateMutation.isPending;
    const onSubmit = (v: FormValues) => {
        if (editing && !isDirty) return onClose();
        const nomenclatureId = v.market_id && v.segment_id && v.category_id && v.family_id
            ? nomByTuple.get(tupleKey(v.market_id, v.segment_id, v.category_id, v.family_id)) ?? null
            : null;
        const payload: ProductCreate = {
            code: v.code,
            name: v.name || null,
            nomenclature_id: nomenclatureId,
            status_id: v.status_id || null,
            import_code_id: v.import_code_id || null,
            product_type_id: v.product_type_id || null,
        };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload);
    };

    const none = getString('any');
    return (
        <FormDialog open onClose={onClose} pending={pending} wide submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'create'))} — ${getString('product')}`}
            onSubmit={handleSubmit(onSubmit)}>
            <FormField label={cfl(getString('productCode'))} htmlFor="product-code" required error={errors.code?.message}>
                <Input id="product-code" autoFocus maxLength={9} inputMode="numeric" aria-invalid={!!errors.code}
                    className="bg-input-bg" {...register('code')} />
            </FormField>
            <FormField label={cfl(getString('productName'))} htmlFor="product-name" error={errors.name?.message}>
                <Input id="product-name" maxLength={128} aria-invalid={!!errors.name} className="bg-input-bg" {...register('name')} />
            </FormField>

            <Controller name="market_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('market'))} value={field.value} placeholder={none}
                    options={markets.map((m) => ({ id: m.id, name: m.name }))}
                    onChange={(v) => { field.onChange(v); clearBelow('segment_id', 'category_id', 'family_id'); }} />
            )} />
            <Controller name="segment_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('segment'))} value={field.value} placeholder={none} disabled={!marketId}
                    options={segments.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
                    onChange={(v) => { field.onChange(v); clearBelow('category_id', 'family_id'); }} />
            )} />
            <Controller name="category_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('category'))} value={field.value} placeholder={none} disabled={!segmentId}
                    options={categories.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
                    onChange={(v) => { field.onChange(v); clearBelow('family_id'); }} />
            )} />
            <Controller name="family_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('family'))} value={field.value} placeholder={none} disabled={!categoryId}
                    options={families.map((f) => ({ id: f.id, name: f.name, code: f.code }))} onChange={field.onChange} />
            )} />
            <Controller name="status_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('productStatus'))} value={field.value} placeholder={none}
                    options={statuses.map((s) => ({ id: s.id, name: s.name || s.code }))} onChange={field.onChange} />
            )} />
            <Controller name="product_type_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('productType'))} value={field.value} placeholder={none}
                    options={productTypes.map((t) => ({ id: t.id, name: t.name || t.code }))} onChange={field.onChange} />
            )} />
            <Controller name="import_code_id" control={control} render={({ field }) => (
                <AsyncCombobox className="sm:col-span-2" label={cfl(getString('importCode'))}
                    valueId={field.value || null}
                    valueLabel={importCodeOptions.find((o) => o.id === field.value)?.label ?? null}
                    onChange={(o) => field.onChange(o?.id ?? NONE_ID)} search={searchImportCodes} placeholder={getString('search')} />
            )} />
        </FormDialog>
    );
}
