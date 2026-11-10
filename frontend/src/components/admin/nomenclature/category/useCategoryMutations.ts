import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory } from './categoryApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const CATEGORY_QK = ['categories'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useCategoryMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: CATEGORY_QK });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
