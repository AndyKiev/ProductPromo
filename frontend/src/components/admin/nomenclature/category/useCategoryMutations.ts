import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory } from './categoryApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const CATEGORY_QK = ['categories'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useCategoryMutations({ setSnackbar, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: CATEGORY_QK });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onCreateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const updateMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onUpdateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { createMutation, updateMutation, deleteMutation };
}
