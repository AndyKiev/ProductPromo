import { axiosInstance } from '@ui/api/axiosInstance';
import { BASE_URL } from '@ui/utils/eNums';
import type { components } from '@/api/catalog.gen';

const BASE = `${BASE_URL}/tax-rates`;

// Shapes come from the catalog's OpenAPI (npm run gen:api). `rate` is a Decimal: a string
// on the way out, number or string on the way in.
type Schemas = components['schemas'];
export type TaxRate = Schemas['TaxRate'];
export type TaxRateCreate = Schemas['TaxRateCreate'];
export type TaxRateUpdate = Schemas['TaxRateUpdate'];

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
