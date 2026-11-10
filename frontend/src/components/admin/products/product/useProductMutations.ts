import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, deleteProduct } from './productApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const PRODUCT_QK = ['products'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useProductMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: PRODUCT_QK });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
