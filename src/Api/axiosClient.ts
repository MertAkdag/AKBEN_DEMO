import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../Utils/logger';

const BASE_URL = 'https://technical-test-backend.bkns-software.com/api';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Her isteğe token ekle
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: 401 hatalarını yakala (Token expire durumu vs.)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Buraya refresh token mantığı veya logout yönlendirmesi eklenebilir.
    // Şimdilik basit tutuyoruz.
    if (error.response && error.response.status === 401) {
      // Token geçersiz, belki logout yapılabilir
      // await SecureStore.deleteItemAsync('accessToken');
      logger.warn('401 from API', error.response.data);
    }
    return Promise.reject(error);
  }
);

