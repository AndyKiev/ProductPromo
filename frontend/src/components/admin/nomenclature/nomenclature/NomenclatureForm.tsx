import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Combobox } from '@ui/components/common/Combobox';
import { FormDialog } from '@ui/components/common/FormDialog';
import type { Nomenclature, NomenclatureCreate, NomenclatureUpdate, MutationResponse } from './nomenclatureApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { fetchMarkets } from '../market/marketApi';
import { fetchSegments } from '../segment/segmentApi';
import { fetchCategories } from '../category/categoryApi';
import { fetchFamilies } from '../family/familyApi';
import { EMPTY } from '@ui/utils/empty';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    market_id: z.number().min(1, 'required'),
    segment_id: z.number().min(1, 'required'),
    category_id: z.number().min(1, 'required'),
    family_id: z.number().min(1, 'required'),
});
type FormValues = z.infer<typeof schema>;

interface Props {
    editing: Nomenclature | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, NomenclatureCreate>;
    updateMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, { id: number; data: NomenclatureUpdate }>;
}

/** Link = market > segment > category > family; each level is filtered by the one above.
 *  Mounted fresh per open by the parent (key). */
export function NomenclatureForm({ editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    const { control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            market_id: editing?.market_id ?? 0, segment_id: editing?.segment_id ?? 0,
            category_id: editing?.category_id ?? 0, family_id: editing?.family_id ?? 0,
        },
    });
    const [marketId, segmentId, categoryId] = watch(['market_id', 'segment_id', 'category_id']);

    const { data: markets = EMPTY } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = EMPTY } = useQuery({
        queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId,
    });
    const { data: categories = EMPTY } = useQuery({
        queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId,
    });
    const { data: families = EMPTY } = useQuery({
        queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId,
    });

    const pending = createMutation.isPending || updateMutation.isPending;
    const clear = (...names: (keyof FormValues)[]) => names.forEach((n) => setValue(n, 0, { shouldDirty: true }));
    const placeholder = cfl(getString('selectPlaceholder') || 'select…');
    const err = (k: keyof FormValues) => errors[k]?.message;

    const onSubmit = (values: FormValues) => {
        if (editing && !isDirty) return onClose();
        if (editing) updateMutation.mutate({ id: editing.id, data: values });
        else createMutation.mutate(values);
    };

    return (
        <FormDialog open onClose={onClose} pending={pending} wide submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'create'))} — ${getString('nomenclature')}`}
            onSubmit={handleSubmit(onSubmit)}>
            <Controller name="market_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('market'))} required value={field.value} placeholder={placeholder}
                    options={markets} error={!!err('market_id')} helperText={err('market_id') && getString(err('market_id')!)}
                    onChange={(id) => { field.onChange(id); clear('segment_id', 'category_id', 'family_id'); }} />
            )} />
            <Controller name="segment_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('segment'))} required value={field.value} placeholder={placeholder}
                    options={segments} disabled={!marketId} error={!!err('segment_id')} helperText={err('segment_id') && getString(err('segment_id')!)}
                    onChange={(id) => { field.onChange(id); clear('category_id', 'family_id'); }} />
            )} />
            <Controller name="category_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('category'))} required value={field.value} placeholder={placeholder}
                    options={categories} disabled={!segmentId} error={!!err('category_id')} helperText={err('category_id') && getString(err('category_id')!)}
                    onChange={(id) => { field.onChange(id); clear('family_id'); }} />
            )} />
            <Controller name="family_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('family'))} required value={field.value} placeholder={placeholder}
                    options={families} disabled={!categoryId} error={!!err('family_id')} helperText={err('family_id') && getString(err('family_id')!)}
                    onChange={field.onChange} />
            )} />
        </FormDialog>
    );
}
