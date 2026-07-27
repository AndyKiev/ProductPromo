import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/families`;

export interface Family {
    id: number;
    status_id: number;
    category_id: number;
    code: string;
    name: string;
    status_name: string | null;
    category_name: string | null;

}

export interface FamilyCreate {
    category_id: number;
    status_id: number;
    code: string;
    name: string;
}

export interface FamilyUpdate {
    category_id?: number;
    status_id?: number;
    code?: string;
    name?: string;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchFamilies = async (categoryId?: number): Promise<Family[]> => {
    const res = await axiosInstance.get<Family[]>(BASE, { params: { category_id: categoryId } });
    return res.data ?? [];
};

export const createFamily = async (body: FamilyCreate): Promise<MutationResponse<Family>> =>
    (await axiosInstance.post<MutationResponse<Family>>(BASE, body)).data;

export const updateFamily = async ({ id, data }: { id: number; data: FamilyUpdate }): Promise<MutationResponse<Family>> =>
    (await axiosInstance.patch<MutationResponse<Family>>(`${BASE}/${id}`, data)).data;

export const deleteFamily = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
