import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createKeyLink1, updateKeyLink1, deleteKeyLink1,
  createKeyLink2, updateKeyLink2, deleteKeyLink2,
  createKeyLink3, updateKeyLink3, deleteKeyLink3,
} from './keyLinkApi';
import { notify, notifyApiError } from '@ui/components/common/notify';

export const KEY_LINK_QK = ['nomenclature_key_links'] as const;

interface Props {
    onSuccess?: () => void;
}

export function useKeyLink1Mutations({ onSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY_LINK_QK });

    const createMutation = useMutation({
        mutationFn: createKeyLink1,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateKeyLink1,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteKeyLink1,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}

export function useKeyLink2Mutations({ onSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY_LINK_QK });

    const createMutation = useMutation({
        mutationFn: createKeyLink2,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateKeyLink2,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteKeyLink2,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}

export function useKeyLink3Mutations({ onSuccess }: Props) {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY_LINK_QK });

    const createMutation = useMutation({
        mutationFn: createKeyLink3,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateKeyLink3,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteKeyLink3,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); onSuccess?.(); },
        onError: (err: Error) => notifyApiError(err),
    });
    return { createMutation, updateMutation, deleteMutation };
}
