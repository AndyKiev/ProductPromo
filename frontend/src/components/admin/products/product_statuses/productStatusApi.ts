import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/product-statuses`;

export interface ProductStatus {
    id: number;
    code: string;
    name: string | null;
}

export interface ProductStatusCreate {
    code: string;
    name?: string | null;
}

export type ProductStatusUpdate = Partial<ProductStatusCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchProductStatuses = async (): Promise<ProductStatus[]> => {
    const res = await axiosInstance.get<ProductStatus[]>(BASE);
    return res.data ?? [];
};

export const createProductStatus = async (body: ProductStatusCreate): Promise<MutationResponse<ProductStatus>> =>
    (await axiosInstance.post<MutationResponse<ProductStatus>>(BASE, body)).data;

export const updateProductStatus = async ({ id, data }: { id: number; data: ProductStatusUpdate }): Promise<MutationResponse<ProductStatus>> =>
    (await axiosInstance.patch<MutationResponse<ProductStatus>>(`${BASE}/${id}`, data)).data;

export const deleteProductStatus = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
