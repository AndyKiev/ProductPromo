import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNomenclatureKey, updateNomenclatureKey, deleteNomenclatureKey } from './nomenclature_keyApi';

type Snackbar = { open: boolean; message: string; severity: 'success' | 'error' };
export const NOMENCLATURE_KEY_QK = ['nomenclature_keys'] as const;

interface Props {
    setSnackbar: (s: Snackbar) => void;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useNomenclatureKeyMutations({ setSnackbar, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: NOMENCLATURE_KEY_QK });

    const createMutation = useMutation({
        mutationFn: createNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onCreateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const updateMutation = useMutation({
        mutationFn: updateNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onUpdateSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); setSnackbar({ open: true, message: res.detail, severity: 'success' }); onDeleteSuccess?.(); },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });
    return { createMutation, updateMutation, deleteMutation };
}
