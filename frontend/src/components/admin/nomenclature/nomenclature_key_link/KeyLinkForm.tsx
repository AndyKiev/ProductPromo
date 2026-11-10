import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { AsyncCombobox, type AsyncOption } from '@ui/components/common/AsyncCombobox';
import { Combobox, type EntityOption } from '@ui/components/common/Combobox';
import { FormDialog } from '@ui/components/common/FormDialog';
import type { KeyLink, KeyLinkCreate, KeyLinkUpdate, MutationResponse } from './keyLinkApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    status_id: z.number().min(1, 'required'),
    parent_id: z.number().min(1, 'required'),
    key_id: z.number().min(1, 'required'),
});
type FormValues = z.infer<typeof schema>;

interface Props {
    level: number;
    editing: KeyLink | null;
    parentId: number;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<KeyLink>, Error, KeyLinkCreate>;
    updateMutation: UseMutationResult<MutationResponse<KeyLink>, Error, { id: number; data: KeyLinkUpdate }>;
    statusOptions: EntityOption[];
    searchKeys: (query: string) => Promise<AsyncOption[]>;
}

/** Add / edit one key link (level 1-3). Mounted fresh per open by the tree (key). */
export function KeyLinkForm({ level, editing, parentId, onClose, createMutation, updateMutation, statusOptions, searchKeys }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    const { control, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            status_id: editing ? editing.status_id : (statusOptions[0]?.id ?? 0),
            parent_id: editing ? editing.parent_id : parentId,
            key_id: editing ? editing.key_id : 0,
        },
    });
    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        if (editing && !isDirty) return onClose();
        if (editing) updateMutation.mutate({ id: editing.id, data: { status_id: values.status_id, key_id: values.key_id } });
        else createMutation.mutate(values as KeyLinkCreate);
    };

    return (
        <FormDialog open onClose={onClose} pending={pending} submitKey={editing ? 'save' : 'create'}
            title={`${cfl(getString(editing ? 'edit' : 'add'))} — L${level}`} onSubmit={handleSubmit(onSubmit)}>
            <Controller name="status_id" control={control} render={({ field }) => (
                <Combobox label={cfl(getString('status'))} required value={field.value} placeholder="—"
                    options={statusOptions} onChange={field.onChange} error={!!errors.status_id}
                    helperText={errors.status_id?.message ? getString(errors.status_id.message) : undefined} />
            )} />
            <Controller name="key_id" control={control} render={({ field }) => (
                <AsyncCombobox label={cfl(getString('key_name'))} required valueId={field.value || null}
                    valueLabel={editing?.key_name ?? null} search={searchKeys}
                    onChange={(o) => field.onChange(o?.id ?? 0)} error={!!errors.key_id}
                    helperText={errors.key_id?.message ? getString(errors.key_id.message) : undefined} />
            )} />
        </FormDialog>
    );
}
