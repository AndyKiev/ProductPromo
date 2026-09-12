import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/supplier-product-statuses`;

export interface SupplierProductStatus {
    id: number;
    code: string;
    name: string | null;
}

export interface SupplierProductStatusCreate {
    code: string;
    name?: string | null;
}

export type SupplierProductStatusUpdate = Partial<SupplierProductStatusCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchSupplierProductStatuses = async (): Promise<SupplierProductStatus[]> => {
    const res = await axiosInstance.get<SupplierProductStatus[]>(BASE);
    return res.data ?? [];
};

export const createSupplierProductStatus = async (body: SupplierProductStatusCreate): Promise<MutationResponse<SupplierProductStatus>> =>
    (await axiosInstance.post<MutationResponse<SupplierProductStatus>>(BASE, body)).data;

export const updateSupplierProductStatus = async ({ id, data }: { id: number; data: SupplierProductStatusUpdate }): Promise<MutationResponse<SupplierProductStatus>> =>
    (await axiosInstance.patch<MutationResponse<SupplierProductStatus>>(`${BASE}/${id}`, data)).data;

export const deleteSupplierProductStatus = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
