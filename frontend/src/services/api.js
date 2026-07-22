let rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
if (rawBase !== '/api' && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}
const API_BASE_URL = rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Token in outgoing HTTP requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('lunar_user') || 'null');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
