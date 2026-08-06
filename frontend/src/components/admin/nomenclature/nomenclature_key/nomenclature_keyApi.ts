import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/keys`;

export interface NomenclatureKey {
    id: number;
    name: string;
    created_at: string;
}

export interface NomenclatureKeyCreate {
    name: string;
}

export interface NomenclatureKeyUpdate {
    name?: string;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchNomenclatureKeys = async (): Promise<NomenclatureKey[]> => {
    const res = await axiosInstance.get<NomenclatureKey[]>(BASE);
    return res.data ?? [];
};

export const searchNomenclatureKeys = async (q: string, limit = 20): Promise<NomenclatureKey[]> => {
    const res = await axiosInstance.get<NomenclatureKey[]>(BASE, { params: { q, limit } });
    return res.data ?? [];
};

export const createNomenclatureKey = async (body: NomenclatureKeyCreate): Promise<MutationResponse<NomenclatureKey>> =>
    (await axiosInstance.post<MutationResponse<NomenclatureKey>>(BASE, body)).data;

export const updateNomenclatureKey = async ({ id, data }: { id: number; data: NomenclatureKeyUpdate }): Promise<MutationResponse<NomenclatureKey>> =>
    (await axiosInstance.patch<MutationResponse<NomenclatureKey>>(`${BASE}/${id}`, data)).data;

export const deleteNomenclatureKey = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
