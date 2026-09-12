import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductSupplier, deleteProductSupplier } from './productSupplierApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const PRODUCT_SUPPLIER_QK = ['product_suppliers'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onDeleteSuccess?: () => void;
}

export function useProductSupplierMutations({ setSnackbar, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: PRODUCT_SUPPLIER_QK });

    const updateMutation = useMutation({
        mutationFn: updateProductSupplier,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteProductSupplier,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { updateMutation, deleteMutation };
}
