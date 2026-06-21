// Base URL for the API. Empty VITE_BACKEND_API_URL => same-origin (via nginx).
const API_ROOT = import.meta.env.VITE_BACKEND_API_URL ?? '';
export const BASE_URL = `${API_ROOT}/api/v1`;

export const defaultLangShortName = 'eng';
