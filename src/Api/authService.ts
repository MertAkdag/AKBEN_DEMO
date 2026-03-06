import * as SecureStore from 'expo-secure-store';
import type { User } from '../domain/entities/User';
import { normalizeUser } from '../domain/entities/User';
import { axiosClient, type ApiResponse } from './axiosClient';
import { API_SERVICES } from '../Constants/env';
import { logger } from '../Utils/logger';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/* ─── API response tipleri ─── */
interface ApiLoginData {
  accessToken: string;
  refreshToken: string;
  user: any; // normalizeUser ile dönüştürülecek
}

interface ApiMeData {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cari?: { id: string; cariAdi: string };
  isActive: boolean;
  lastLogin?: string;
  roles: string[];
}

export const authService = {
  /**
   * Kullanıcı girişi
   * POST /iam/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axiosClient.post<ApiResponse<ApiLoginData>>(
      `/${API_SERVICES.IAM}/login`,
      { userNameOrEmail: email, password },
    );

    const { accessToken, refreshToken, user: rawUser } = response.data.data;

    // Token'ları kaydet
    if (accessToken) await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);

    // User'ı normalize et ve kaydet
    const user = normalizeUser(rawUser);
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    logger.info('[authService] Login başarılı:', user.name);

    return { user, accessToken, refreshToken };
  },

  /**
   * Çıkış
   * POST /iam/logout
   */
  async logout(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        await axiosClient.post(`/${API_SERVICES.IAM}/logout`);
      }
    } catch (err) {
      logger.warn('[authService] Logout API hatası (yine de temizlenecek):', err);
    }
    // Her durumda yerel verileri temizle
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  },

  /**
   * Mevcut kullanıcı bilgilerini API'den al
   * GET /iam/me
   */
  async getMe(): Promise<User> {
    const response = await axiosClient.get<ApiResponse<ApiMeData>>(
      `/${API_SERVICES.IAM}/me`,
    );
    const user = normalizeUser(response.data.data);

    // Güncel user bilgisini kaydet
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    return user;
  },

  /**
   * SecureStore'dan kaydedilmiş kullanıcıyı getir
   */
  async getStoredUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * SecureStore'dan kaydedilmiş token'ı getir
   */
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  },
};

