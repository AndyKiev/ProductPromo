import { axiosInstance } from '@ui/api/axiosInstance';
import { BASE_URL } from '@ui/utils/eNums';

const BASE = `${BASE_URL}/directories/status_types`;

export interface StatusType { id: number; code: string | null; name: string | null; }

export const fetchStatusTypes = async (): Promise<StatusType[]> => {
    const res = await axiosInstance.get<StatusType[]>(BASE);
    return res.data ?? [];
};
