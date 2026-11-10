import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Input } from '@ui/components/ui/input';
import { FormDialog, FormField } from '@ui/components/common/FormDialog';
import { SelectFilter } from '@ui/components/common/filters';
import type { Supplier, SupplierCreate, SupplierUpdate, MutationResponse } from './supplierApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchSupplierStatuses } from '../supplier_statuses/supplierStatusApi';
import { EMPTY } from '@ui/utils/empty';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    // Numeric by contract (the catalog indexes code::integer): digits only, fits int4.
    code: z.string().trim().min(1, 'required').regex(/^\d{1,9}$/, 'digitsOnly'),
    name: z.string().trim().max(128, 'max_length'),
    status_id: z.number(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
    editing: Supplier | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Supplier>, Error, SupplierCreate>;
    updateMutation: UseMutationResult<MutationResponse<Supplier>, Error, { id: number; data: SupplierUpdate }>;
}

/** Mounted fresh per open by the parent (key). */
export function SupplierForm({ editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: catalogStrings });
    const { data: statuses = EMPTY } = useQuery({ queryKey: ['supplier_statuses'], queryFn: fetchSupplierStatuses, staleTime: Infinity });
    const { register, control, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { code: editing?.code ?? '', name: editing?.name ?? '', status_id: editing?.status_id ?? 0 },
    });
    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        if (editing && !isDirty) return onClose();
        const payload: SupplierCreate = { code: values.code, name: values.name || null, status_id: values.status_id || null };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload);
    };

    return (
        <FormDialog open onClose={onClose} pending={pending} submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'create'))} — ${getString('supplier')}`}
            onSubmit={handleSubmit(onSubmit)}>
            <FormField label={cfl(getString('supplierCode'))} htmlFor="supplier-code" required error={errors.code?.message}>
                <Input id="supplier-code" autoFocus maxLength={9} inputMode="numeric" aria-invalid={!!errors.code} className="bg-input-bg" {...register('code')} />
            </FormField>
            <FormField label={cfl(getString('supplierName'))} htmlFor="supplier-name" error={errors.name?.message}>
                <Input id="supplier-name" maxLength={128} aria-invalid={!!errors.name} className="bg-input-bg" {...register('name')} />
            </FormField>
            <Controller name="status_id" control={control} render={({ field }) => (
                <SelectFilter label={cfl(getString('supplierStatus'))} value={field.value} onChange={field.onChange}
                    anyLabel={getString('any')} options={statuses.map((s) => ({ id: s.id, label: s.name || s.code }))} />
            )} />
        </FormDialog>
    );
}
