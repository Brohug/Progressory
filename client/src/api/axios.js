import axios from 'axios';

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return 'http://localhost:4000/api';
  }

  const trimmedValue = value.trim().replace(/\/+$/, '');

  if (!trimmedValue) {
    return 'http://localhost:4000/api';
  }

  return trimmedValue.endsWith('/api')
    ? trimmedValue
    : `${trimmedValue}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const billingRequired = error?.response?.data?.billing_required === true;
    const requestUrl = error?.config?.url || '';
    const isAuthSetupRequest =
      requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/member-access');

    if (billingRequired && (status === 402 || status === 403)) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const isOwner = storedUser?.role === 'owner';

        if (
          isOwner
          && typeof window !== 'undefined'
          && window.location.pathname !== '/billing'
        ) {
          window.location.href = '/billing';
        }
      } catch {
        // Ignore localStorage parsing issues and fall through to the caller.
      }
    }

    if (status === 401 && !isAuthSetupRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
