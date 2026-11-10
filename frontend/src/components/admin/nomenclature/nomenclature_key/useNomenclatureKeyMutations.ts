import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNomenclatureKey, updateNomenclatureKey, deleteNomenclatureKey } from './nomenclature_keyApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const NOMENCLATURE_KEY_QK = ['nomenclature_keys'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useNomenclatureKeyMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: NOMENCLATURE_KEY_QK });

    const createMutation = useMutation({
        mutationFn: createNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteNomenclatureKey,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
