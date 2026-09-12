import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupplier, updateSupplier, deleteSupplier } from './supplierApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const SUPPLIER_QK = ['suppliers'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useSupplierMutations({ setSnackbar, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: SUPPLIER_QK });

    const createMutation = useMutation({
        mutationFn: createSupplier,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onCreateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const updateMutation = useMutation({
        mutationFn: updateSupplier,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onUpdateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { createMutation, updateMutation, deleteMutation };
}
