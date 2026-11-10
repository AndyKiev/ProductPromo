import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductSupplier, deleteProductSupplier } from './productSupplierApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const PRODUCT_SUPPLIER_QK = ['product_suppliers'] as const;

interface Props {
    onDeleteSuccess?: () => void;
}

export function useProductSupplierMutations({ onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: PRODUCT_SUPPLIER_QK });

    const updateMutation = useMutation({
        mutationFn: updateProductSupplier,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteProductSupplier,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { updateMutation, deleteMutation };
}
