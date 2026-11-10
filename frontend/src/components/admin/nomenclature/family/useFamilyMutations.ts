import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFamily, updateFamily, deleteFamily } from './familyApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const FAMILY_QK = ['families'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useFamilyMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: FAMILY_QK });

    const createMutation = useMutation({
        mutationFn: createFamily,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateFamily,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteFamily,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
