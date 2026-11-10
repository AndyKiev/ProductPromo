import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupplier, updateSupplier, deleteSupplier } from './supplierApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const SUPPLIER_QK = ['suppliers'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useSupplierMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: SUPPLIER_QK });

    const createMutation = useMutation({
        mutationFn: createSupplier,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateSupplier,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
