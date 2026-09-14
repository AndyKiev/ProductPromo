import { axiosInstance } from './axiosInstance';
import { BASE_URL } from '../utils/eNums';
import type { Language, MessageBundle, UserProfile } from '../i18n/types';

export const fetchLanguages = async () => (await axiosInstance.get<Language[]>(`${BASE_URL}/langs`)).data;
export const fetchMessages = async (langId: number) => (await axiosInstance.get<MessageBundle>(`${BASE_URL}/messages`, { params: { lang_id: langId } })).data;
export const fetchProfile = async () => (await axiosInstance.get<UserProfile>(`${BASE_URL}/jwt/users/me`)).data;
export const saveLanguage = async (langId: number) => (await axiosInstance.patch<UserProfile>(`${BASE_URL}/jwt/users/me/language`, { lang_id: langId })).data;
