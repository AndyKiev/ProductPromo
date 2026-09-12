import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/product-taxes`;

export interface Page<T> { items: T[]; total: number; }

export interface ProductTax {
    id: number;
    product_id: number;
    tax_type_id: number;
    tax_rate_id: number;
    product_code: string | null;
    product_name: string | null;
    tax_type_code: string | null;
    tax_type_name: string | null;
    rate: number | null;
}

export interface ProductTaxUpdate { tax_rate_id?: number | null; }

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
