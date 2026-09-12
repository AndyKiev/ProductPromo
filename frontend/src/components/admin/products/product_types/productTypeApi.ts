import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/product-types`;

export interface ProductType {
    id: number;
    code: string;
    name: string | null;
}

export interface ProductTypeCreate {
    code: string;
    name?: string | null;
}

export type ProductTypeUpdate = Partial<ProductTypeCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchProductTypes = async (): Promise<ProductType[]> => {
    const res = await axiosInstance.get<ProductType[]>(BASE);
    return res.data ?? [];
};

export const createProductType = async (body: ProductTypeCreate): Promise<MutationResponse<ProductType>> =>
    (await axiosInstance.post<MutationResponse<ProductType>>(BASE, body)).data;

export const updateProductType = async ({ id, data }: { id: number; data: ProductTypeUpdate }): Promise<MutationResponse<ProductType>> =>
    (await axiosInstance.patch<MutationResponse<ProductType>>(`${BASE}/${id}`, data)).data;

export const deleteProductType = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
