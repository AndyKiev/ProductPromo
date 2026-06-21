import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';

const BASE = `${BASE_URL}/nomenclature/segments`;

export interface Segment {
    id: number;
    status_id: number;
    market_id: number;
    code: string;
    name: string;
    status_name: string | null;
    market_name: string | null;

}

export interface SegmentCreate {
    market_id: number;
    status_id: number;
    code: string;
    name: string;
}

export interface SegmentUpdate {
    market_id?: number;
    status_id?: number;
    code?: string;
    name?: string;
}

export interface MutationResponse<T> { detail: string; data: T; }

export const fetchSegments = async (marketId?: number): Promise<Segment[]> => {
    const res = await axiosInstance.get<Segment[]>(BASE, { params: { market_id: marketId } });
    return res.data ?? [];
};

export const createSegment = async (body: SegmentCreate): Promise<MutationResponse<Segment>> =>
    (await axiosInstance.post<MutationResponse<Segment>>(BASE, body)).data;

export const updateSegment = async ({ id, data }: { id: number; data: SegmentUpdate }): Promise<MutationResponse<Segment>> =>
    (await axiosInstance.patch<MutationResponse<Segment>>(`${BASE}/${id}`, data)).data;

export const deleteSegment = async (id: number): Promise<MutationResponse<null>> =>
    (await axiosInstance.delete<MutationResponse<null>>(`${BASE}/${id}`)).data;
