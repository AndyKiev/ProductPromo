import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/suppliers`;

export interface Page<T> { items: T[]; total: number; }

export interface Supplier {
    id: number;
    code: string;
    name: string | null;
    status_id: number | null;
    status_name: string | null;
}

export interface SupplierCreate {
    code: string;
    name?: string | null;
    status_id?: number | null;
}

export type SupplierUpdate = Partial<SupplierCreate>;

export interface SupplierListParams {
    q?: string;
    status_id?: number;
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchSuppliers = async (params: SupplierListParams = {}): Promise<Page<Supplier>> => {
    const res = await axiosInstance.get<Page<Supplier>>(BASE, { params });
    return res.data ?? { items: [], total: 0 };
};

export const createSupplier = async (body: SupplierCreate): Promise<MutationResponse<Supplier>> =>
    (await axiosInstance.post<MutationResponse<Supplier>>(BASE, body)).data;

export const updateSupplier = async ({ id, data }: { id: number; data: SupplierUpdate }): Promise<MutationResponse<Supplier>> =>
    (await axiosInstance.patch<MutationResponse<Supplier>>(`${BASE}/${id}`, data)).data;

export const deleteSupplier = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
