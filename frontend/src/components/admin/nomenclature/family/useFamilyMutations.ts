import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFamily, updateFamily, deleteFamily } from './familyApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const FAMILY_QK = ['families'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useFamilyMutations({ setSnackbar, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: FAMILY_QK });

    const createMutation = useMutation({
        mutationFn: createFamily,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onCreateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const updateMutation = useMutation({
        mutationFn: updateFamily,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onUpdateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteFamily,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { createMutation, updateMutation, deleteMutation };
}
