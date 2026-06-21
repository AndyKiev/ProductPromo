import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/categories`;

export interface Category {
    id: number;
    status_id: number;
    segment_id: number;
    code: string;
    name: string;
    status_name: string | null;
    segment_name: string | null;

}

export interface CategoryCreate {
    segment_id: number;
    status_id: number;
    code: string;
    name: string;
}

export interface CategoryUpdate {
    segment_id?: number;
    status_id?: number;
    code?: string;
    name?: string;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchCategories= async (segmentId?: number): Promise<Category[]> => {
    const res = await axiosInstance.get<Category[]>(BASE, { params: { segment_id: segmentId } });
    return res.data ?? [];
};

export const createCategory = async (body: CategoryCreate): Promise<MutationResponse<Category>> =>
    (await axiosInstance.post<MutationResponse<Category>>(BASE, body)).data;

export const updateCategory = async ({ id, data }: { id: number; data: CategoryUpdate }): Promise<MutationResponse<Category>> =>
    (await axiosInstance.patch<MutationResponse<Category>>(`${BASE}/${id}`, data)).data;

export const deleteCategory = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
