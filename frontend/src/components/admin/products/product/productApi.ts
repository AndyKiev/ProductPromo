import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/products`;

export interface Page<T> { items: T[]; total: number; }

export interface Product {
    id: number;
    code: string;
    name: string | null;
    nomenclature_id: number | null;
    status_id: number | null;
    import_code_id: number | null;
    product_type_id: number | null;
    market_name: string | null;
    segment_name: string | null;
    category_name: string | null;
    family_name: string | null;
    status_name: string | null;
    import_code: string | null;
    import_code_description: string | null;
    product_type_code: string | null;
    product_type_name: string | null;
}

export interface ProductCreate {
    code: string;
    name?: string | null;
    nomenclature_id?: number | null;
    status_id?: number | null;
    import_code_id?: number | null;
    product_type_id?: number | null;
}

export type ProductUpdate = Partial<ProductCreate>;

export interface ProductListParams {
    q?: string;
    market_id?: number;
    segment_id?: number;
    category_id?: number;
    family_id?: number;
    status_id?: number;
    import_code_id?: number;
    product_type_id?: number;
    supplier_id?: number;
    ean?: string;
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchProducts = async (params: ProductListParams = {}): Promise<Page<Product>> => {
    const res = await axiosInstance.get<Page<Product>>(BASE, { params });
    return res.data ?? { items: [], total: 0 };
};

export const createProduct = async (body: ProductCreate): Promise<MutationResponse<Product>> =>
    (await axiosInstance.post<MutationResponse<Product>>(BASE, body)).data;

export const updateProduct = async ({ id, data }: { id: number; data: ProductUpdate }): Promise<MutationResponse<Product>> =>
    (await axiosInstance.patch<MutationResponse<Product>>(`${BASE}/${id}`, data)).data;

export const deleteProduct = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
