import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/supplier-statuses`;

export interface SupplierStatus {
    id: number;
    code: string;
    name: string | null;
}

export interface SupplierStatusCreate {
    code: string;
    name?: string | null;
}

export type SupplierStatusUpdate = Partial<SupplierStatusCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchSupplierStatuses = async (): Promise<SupplierStatus[]> => {
    const res = await axiosInstance.get<SupplierStatus[]>(BASE);
    return res.data ?? [];
};

export const createSupplierStatus = async (body: SupplierStatusCreate): Promise<MutationResponse<SupplierStatus>> =>
    (await axiosInstance.post<MutationResponse<SupplierStatus>>(BASE, body)).data;

export const updateSupplierStatus = async ({ id, data }: { id: number; data: SupplierStatusUpdate }): Promise<MutationResponse<SupplierStatus>> =>
    (await axiosInstance.patch<MutationResponse<SupplierStatus>>(`${BASE}/${id}`, data)).data;

export const deleteSupplierStatus = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
