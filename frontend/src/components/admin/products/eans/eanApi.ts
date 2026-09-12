import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/eans`;

export interface Ean {
    id: number;
    product_id: number;
    ean: string;
}

export interface EanCreate {
    product_id: number;
    ean: string;
}

export type EanUpdate = Partial<EanCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const EAN_QK = ['eans'] as const;

export const fetchEans = async (productId: number, q?: string): Promise<Ean[]> => {
    const res = await axiosInstance.get<Ean[]>(BASE, { params: { product_id: productId, q: q || undefined } });
    return res.data ?? [];
};

export const createEan = async (body: EanCreate): Promise<MutationResponse<Ean>> =>
    (await axiosInstance.post<MutationResponse<Ean>>(BASE, body)).data;

export const updateEan = async ({ id, data }: { id: number; data: EanUpdate }): Promise<MutationResponse<Ean>> =>
    (await axiosInstance.patch<MutationResponse<Ean>>(`${BASE}/${id}`, data)).data;

export const deleteEan = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
