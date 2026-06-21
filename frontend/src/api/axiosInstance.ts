import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create();

// attach bearer token if present
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// surface backend {detail} as the thrown error message (mutations show it)
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const detail = error?.response?.data?.detail;
    if (detail) error.message = detail;
    return Promise.reject(error);
  },
);
