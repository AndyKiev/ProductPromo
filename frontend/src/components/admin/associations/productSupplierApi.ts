import { axiosInstance } from '../../../api/axiosInstance';
import { BASE_URL } from '../../../utils/eNums';

const BASE = `${BASE_URL}/product-suppliers`;

export interface Page<T> { items: T[]; total: number; }

export interface ProductSupplier {
    id: number;
    product_id: number;
    supplier_id: number;
    status_id: number | null;
    product_code: string | null;
    product_name: string | null;
    supplier_code: string | null;
    supplier_name: string | null;
    status_name: string | null;
}

export interface ProductSupplierUpdate { status_id?: number | null; }

export interface ProductSupplierListParams {
    q?: string;
    product_id?: number;
    supplier_id?: number;
    status_id?: number;
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchProductSuppliers = async (params: ProductSupplierListParams = {}): Promise<Page<ProductSupplier>> => {
    const res = await axiosInstance.get<Page<ProductSupplier>>(BASE, { params });
    return res.data ?? { items: [], total: 0 };
};

export const updateProductSupplier = async ({ id, data }: { id: number; data: ProductSupplierUpdate }): Promise<MutationResponse<ProductSupplier>> =>
    (await axiosInstance.patch<MutationResponse<ProductSupplier>>(`${BASE}/${id}`, data)).data;

export const deleteProductSupplier = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
