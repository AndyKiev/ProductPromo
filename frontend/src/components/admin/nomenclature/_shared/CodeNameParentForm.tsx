// One form for Segment / Category / Family: code + name + parent (searchable) + status.
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Input } from '@ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/components/ui/select';
import { Combobox, type EntityOption } from '@ui/components/common/Combobox';
import { FormDialog, FormField } from '@ui/components/common/FormDialog';
import { fetchStatusTypes } from '../status_type/statusTypeApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    code: z.string().trim().min(1, 'required').max(8, 'max_length'),
    name: z.string().trim().min(1, 'required').max(64, 'max_length'),
    parent_id: z.number().min(1, 'required'),
    status_id: z.number().min(1, 'required'),
});
type FormValues = z.infer<typeof schema>;

interface Record { id: number; code: string; name: string; status_id: number }
interface Body { code: string; name: string; status_id: number }
type MutationResponse<T> = { detail: string; data: T };

interface Props<R extends Record, F extends string> {
    /** Translation key of the entity (dialog title). */
    entityKey: string;
    /** Body field of the parent id, e.g. "market_id". */
    parentField: F;
    parentLabelKey: string;
    parentQueryKey: readonly unknown[];
    fetchParents: () => Promise<EntityOption[]>;
    editing: R | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<R>, Error, Body & { [K in F]: number }>;
    updateMutation: UseMutationResult<MutationResponse<R>, Error, { id: number; data: Partial<Body & { [K in F]: number }> }>;
}

/** Mounted fresh per open by the parent (key). */
export function CodeNameParentForm<R extends Record, F extends string>({
    entityKey, parentField, parentLabelKey, parentQueryKey, fetchParents, editing, onClose, createMutation, updateMutation,
}: Props<R, F>) {
    const getString = useString({ str: nomenclatureStrings });
    const { data: parents = EMPTY } = useQuery({ queryKey: parentQueryKey, queryFn: fetchParents });
    const { data: statuses = EMPTY } = useQuery({
        queryKey: ['directories', 'status_types'], queryFn: fetchStatusTypes, staleTime: Infinity,
    });
    const { register, control, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: editing?.code ?? '',
            name: editing?.name ?? '',
            parent_id: editing ? Number((editing as unknown as { [k: string]: number })[parentField]) || 0 : 0,
            status_id: editing?.status_id ?? 0,
        },
    });
    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = ({ parent_id, ...rest }: FormValues) => {
        if (editing && !isDirty) return onClose();
        const body = { ...rest, [parentField]: parent_id } as Body & { [K in F]: number };
        if (editing) updateMutation.mutate({ id: editing.id, data: body });
        else createMutation.mutate(body);
    };

    return (
        <FormDialog open onClose={onClose} pending={pending} wide submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'create'))} — ${getString(entityKey)}`}
            onSubmit={handleSubmit(onSubmit)}>
            <FormField label={cfl(getString('code'))} htmlFor="cnp-code" required error={errors.code?.message}>
                <Input id="cnp-code" autoFocus maxLength={8} aria-invalid={!!errors.code} className="bg-input-bg" {...register('code')} />
            </FormField>
            <FormField label={cfl(getString('name'))} htmlFor="cnp-name" required error={errors.name?.message}>
                <Input id="cnp-name" maxLength={64} aria-invalid={!!errors.name} className="bg-input-bg" {...register('name')} />
            </FormField>
            <Controller name="parent_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString(parentLabelKey))} required value={field.value}
                    placeholder="—" options={parents} onChange={field.onChange}
                    error={!!errors.parent_id}
                    helperText={errors.parent_id?.message ? getString(errors.parent_id.message) : undefined} />
            )} />
            <Controller name="status_id" control={control} render={({ field }) => (
                <FormField label={cfl(getString('status'))} htmlFor="cnp-status" required error={errors.status_id?.message}>
                    <Select value={field.value ? String(field.value) : ''} onValueChange={(v) => field.onChange(Number(v))}>
                        <SelectTrigger id="cnp-status" className="w-full bg-input-bg" aria-invalid={!!errors.status_id}>
                            <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((s: { id: number; name?: string | null; code?: string | null }) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.name ?? s.code ?? s.id}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            )} />
        </FormDialog>
    );
}
