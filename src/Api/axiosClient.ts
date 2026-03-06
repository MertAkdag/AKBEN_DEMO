import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../Utils/logger';
import { API_BASE_URL, API_SERVICES } from '../Constants/env';

/* ─── Ortak API response tipi ─── */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  type: string;
  timestamp: string;
  requestId: string;
  metadata: {
    pagination?: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

/* ─── Axios instance ─── */
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/* ─── Refresh token kilidi (aynı anda birden fazla refresh isteği önlenir) ─── */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

/* ─── Request interceptor: Her isteğe Bearer token ekle ─── */
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ─── Response interceptor: 401 → otomatik refresh token ─── */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 değilse veya zaten retry yapıldıysa direkt reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Refresh veya login isteğinde 401 gelirse döngüye girme
    const url = originalRequest.url ?? '';
    if (url.includes(`/${API_SERVICES.IAM}/refresh-token`) || url.includes(`/${API_SERVICES.IAM}/login`)) {
      return Promise.reject(error);
    }

    // Zaten refresh yapılıyorsa kuyruğa ekle
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${API_BASE_URL}/${API_SERVICES.IAM}/refresh-token`,
        { refreshToken: storedRefreshToken },
      );

      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      await SecureStore.setItemAsync('accessToken', newAccessToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);

      logger.info('[axiosClient] Token başarıyla yenilendi');

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      logger.warn('[axiosClient] Refresh token başarısız, oturum sonlandırılıyor', refreshError);
      processQueue(refreshError, null);

      // Token'ları temizle — kullanıcı login ekranına yönlendirilir
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

