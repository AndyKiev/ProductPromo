import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/import-codes`;

export interface ImportCode {
    id: number;
    code: string;
    description: string | null;
}

export interface ImportCodeCreate {
    code: string;
    description?: string | null;
}

export type ImportCodeUpdate = Partial<ImportCodeCreate>;

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchImportCodes = async (): Promise<ImportCode[]> => {
    const res = await axiosInstance.get<ImportCode[]>(BASE);
    return res.data ?? [];
};

export const createImportCode = async (body: ImportCodeCreate): Promise<MutationResponse<ImportCode>> =>
    (await axiosInstance.post<MutationResponse<ImportCode>>(BASE, body)).data;

export const updateImportCode = async ({ id, data }: { id: number; data: ImportCodeUpdate }): Promise<MutationResponse<ImportCode>> =>
    (await axiosInstance.patch<MutationResponse<ImportCode>>(`${BASE}/${id}`, data)).data;

export const deleteImportCode = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
