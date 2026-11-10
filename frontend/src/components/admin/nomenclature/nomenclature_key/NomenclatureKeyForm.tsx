import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { Input } from '@ui/components/ui/input';
import { FormDialog, FormField } from '@ui/components/common/FormDialog';
import type { NomenclatureKey, NomenclatureKeyCreate, NomenclatureKeyUpdate, MutationResponse } from './nomenclature_keyApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    name: z.string().trim().min(1, 'required').max(128, 'max_length'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    editing: NomenclatureKey | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, NomenclatureKeyCreate>;
    updateMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, { id: number; data: NomenclatureKeyUpdate }>;
}

/** Mounted fresh per open by the parent (key), so defaults are the record being edited. */
export function NomenclatureKeyForm({ editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: editing?.name ?? '' },
    });
    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        if (editing && !isDirty) return onClose();
        if (editing) updateMutation.mutate({ id: editing.id, data: values });
        else createMutation.mutate(values as NomenclatureKeyCreate);
    };

    return (
        <FormDialog open onClose={onClose} pending={pending} submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'create'))} — ${getString('nomenclature')}`}
            onSubmit={handleSubmit(onSubmit)}>
            <FormField label={cfl(getString('name'))} htmlFor="nkey-name" required error={errors.name?.message}>
                <Input id="nkey-name" autoFocus maxLength={128} aria-invalid={!!errors.name}
                    className="bg-input-bg" {...register('name')} />
            </FormField>
        </FormDialog>
    );
}
