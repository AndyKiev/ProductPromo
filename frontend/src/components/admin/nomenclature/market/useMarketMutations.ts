import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMarket, updateMarket, deleteMarket } from './marketApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const MARKET_QK = ['markets'] as const;

interface Props {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useMarketMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: MARKET_QK });

    const createMutation = useMutation({
        mutationFn: createMarket,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onCreateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateMarket,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onUpdateSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteMarket,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onDeleteSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
