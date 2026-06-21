import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/links`;

export interface Nomenclature {
    id: number;
    market_id: number;
    segment_id: number;
    category_id: number;
    family_id: number;
    market_name: string | null;
    segment_name: string | null;
    category_name: string | null;
    family_name: string | null;
    created_at: string;
}

export interface NomenclatureCreate {
    market_id: number;
    segment_id: number;
    category_id: number;
    family_id: number;
}

export interface NomenclatureUpdate {
    market_id?: number;
    segment_id?: number;
    category_id?: number;
    family_id?: number;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchNomenclatures = async (): Promise<Nomenclature[]> => {
    const res = await axiosInstance.get<Nomenclature[]>(BASE);
    return res.data ?? [];
};

export const createNomenclature = async (body: NomenclatureCreate): Promise<MutationResponse<Nomenclature>> =>
    (await axiosInstance.post<MutationResponse<Nomenclature>>(BASE, body)).data;

export const updateNomenclature = async ({ id, data }: { id: number; data: NomenclatureUpdate }): Promise<MutationResponse<Nomenclature>> =>
    (await axiosInstance.patch<MutationResponse<Nomenclature>>(`${BASE}/${id}`, data)).data;

export const deleteNomenclature = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
