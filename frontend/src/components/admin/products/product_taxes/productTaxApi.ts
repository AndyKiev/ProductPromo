import { axiosInstance } from '@ui/api/axiosInstance';
import { BASE_URL } from '@ui/utils/eNums';
import type { components } from '@/api/catalog.gen';

const BASE = `${BASE_URL}/product-taxes`;

export interface Page<T> { items: T[]; total: number; }

// Shapes come from the catalog's OpenAPI (npm run gen:api); `rate` is a Decimal string.
type Schemas = components['schemas'];
export type ProductTax = Schemas['ProductTax'];
export type ProductTaxUpdate = Schemas['ProductTaxUpdate'];

export interface ProductTaxListParams {
    q?: string;
    tax_type_id?: number;
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchProductTaxes = async (params: ProductTaxListParams = {}): Promise<Page<ProductTax>> => {
    const res = await axiosInstance.get<Page<ProductTax>>(BASE, { params });
    return res.data ?? { items: [], total: 0 };
};

export const updateProductTax = async ({ id, data }: { id: number; data: ProductTaxUpdate }): Promise<MutationResponse<ProductTax>> =>
    (await axiosInstance.patch<MutationResponse<ProductTax>>(`${BASE}/${id}`, data)).data;

export const deleteProductTax = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
