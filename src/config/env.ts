const fallbackApiUrl = 'http://mgf.vortex-tech.tech/api/v1';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? fallbackApiUrl,
};
