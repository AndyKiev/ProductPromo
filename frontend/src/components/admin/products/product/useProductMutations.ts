import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, deleteProduct } from './productApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const PRODUCT_QK = ['products'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useProductMutations({ setSnackbar, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: PRODUCT_QK });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onCreateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onUpdateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { createMutation, updateMutation, deleteMutation };
}
