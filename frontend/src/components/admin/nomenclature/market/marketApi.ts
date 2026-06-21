import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/markets`;

export interface Market {
    id: number;
    name: string;

}

export interface MarketCreate {
    name: string;
}

export interface MarketUpdate {
    name?: string;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchMarkets = async (): Promise<Market[]> => {
    const res = await axiosInstance.get<Market[]>(BASE);
    return res.data ?? [];
};

export const createMarket = async (body: MarketCreate): Promise<MutationResponse<Market>> =>
    (await axiosInstance.post<MutationResponse<Market>>(BASE, body)).data;

export const updateMarket = async ({ id, data }: { id: number; data: MarketUpdate }): Promise<MutationResponse<Market>> =>
    (await axiosInstance.patch<MutationResponse<Market>>(`${BASE}/${id}`, data)).data;

export const deleteMarket = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
