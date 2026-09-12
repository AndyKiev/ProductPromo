import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/tax-types`;

export interface TaxType {
    id: number;
    code: string;
    name: string | null;
}

export interface TaxTypeCreate {
    code: string;
    name?: string | null;
}

export type TaxTypeUpdate = Partial<TaxTypeCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchTaxTypes = async (): Promise<TaxType[]> => {
    const res = await axiosInstance.get<TaxType[]>(BASE);
    return res.data ?? [];
};

export const createTaxType = async (body: TaxTypeCreate): Promise<MutationResponse<TaxType>> =>
    (await axiosInstance.post<MutationResponse<TaxType>>(BASE, body)).data;

export const updateTaxType = async ({ id, data }: { id: number; data: TaxTypeUpdate }): Promise<MutationResponse<TaxType>> =>
    (await axiosInstance.patch<MutationResponse<TaxType>>(`${BASE}/${id}`, data)).data;

export const deleteTaxType = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
