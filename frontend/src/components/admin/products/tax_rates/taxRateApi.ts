import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/tax-rates`;

export interface TaxRate {
    id: number;
    tax_type_id: number;
    rate: number;
    effective_from: string;
    effective_till: string;
    tax_type_code: string | null;
    tax_type_name: string | null;
}

export interface TaxRateCreate {
    tax_type_id: number;
    rate: number;
    effective_from: string;
    effective_till: string;
}

export type TaxRateUpdate = Partial<TaxRateCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchTaxRates = async (taxTypeId?: number): Promise<TaxRate[]> => {
    const res = await axiosInstance.get<TaxRate[]>(BASE, { params: { tax_type_id: taxTypeId } });
    return res.data ?? [];
};

export const createTaxRate = async (body: TaxRateCreate): Promise<MutationResponse<TaxRate>> =>
    (await axiosInstance.post<MutationResponse<TaxRate>>(BASE, body)).data;

export const updateTaxRate = async ({ id, data }: { id: number; data: TaxRateUpdate }): Promise<MutationResponse<TaxRate>> =>
    (await axiosInstance.patch<MutationResponse<TaxRate>>(`${BASE}/${id}`, data)).data;

export const deleteTaxRate = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
