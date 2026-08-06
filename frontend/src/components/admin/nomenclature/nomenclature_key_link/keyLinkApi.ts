import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/key-links`;

export interface KeyLink {
    id: number;
    status_id: number;
    parent_id: number;
    key_id: number;
    created_at: string | null;
    status_name: string | null;
    key_name: string | null;
    parent_name: string | null;
}

export interface KeyLinkCreate {
    status_id: number;
    parent_id: number;
    key_id: number;
}

export interface KeyLinkUpdate {
    status_id?: number;
    key_id?: number;
}

export interface MutationResponse<T> { detail: string; data: T; }

// ── Level 1 ───────────────────────────
export const fetchKeyLinks1 = async (parentId?: number): Promise<KeyLink[]> => {
    const res = await axiosInstance.get<KeyLink[]>(`${BASE}/1`, { params: { parent_id: parentId } });
    return res.data ?? [];
};

export const createKeyLink1 = async (body: KeyLinkCreate): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.post<MutationResponse<KeyLink>>(`${BASE}/1`, body)).data;

export const updateKeyLink1 = async ({ id, data }: { id: number; data: KeyLinkUpdate }): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.patch<MutationResponse<KeyLink>>(`${BASE}/1/${id}`, data)).data;

export const deleteKeyLink1 = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/1/${id}`)).data;

// ── Level 2 ───────────────────────────
export const fetchKeyLinks2 = async (parentId?: number): Promise<KeyLink[]> => {
    const res = await axiosInstance.get<KeyLink[]>(`${BASE}/2`, { params: { parent_id: parentId } });
    return res.data ?? [];
};

export const createKeyLink2 = async (body: KeyLinkCreate): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.post<MutationResponse<KeyLink>>(`${BASE}/2`, body)).data;

export const updateKeyLink2 = async ({ id, data }: { id: number; data: KeyLinkUpdate }): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.patch<MutationResponse<KeyLink>>(`${BASE}/2/${id}`, data)).data;

export const deleteKeyLink2 = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/2/${id}`)).data;

// ── Level 3 ───────────────────────────
export const fetchKeyLinks3 = async (parentId?: number): Promise<KeyLink[]> => {
    const res = await axiosInstance.get<KeyLink[]>(`${BASE}/3`, { params: { parent_id: parentId } });
    return res.data ?? [];
};

export const createKeyLink3 = async (body: KeyLinkCreate): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.post<MutationResponse<KeyLink>>(`${BASE}/3`, body)).data;

export const updateKeyLink3 = async ({ id, data }: { id: number; data: KeyLinkUpdate }): Promise<MutationResponse<KeyLink>> =>
    (await axiosInstance.patch<MutationResponse<KeyLink>>(`${BASE}/3/${id}`, data)).data;

export const deleteKeyLink3 = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/3/${id}`)).data;
