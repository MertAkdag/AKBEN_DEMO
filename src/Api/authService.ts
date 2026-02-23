import * as SecureStore from 'expo-secure-store';
import type { User } from '../domain/entities/User';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Demo modu: API çağrılmaz, giriş/çıkış tamamen yerel. */
const DEMO_MODE = true;

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (DEMO_MODE) {
      const name = email.split('@')[0] || 'Kullanıcı';
      const user: User = {
        id: `demo-${Date.now()}`,
        email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: 'ADMIN',
      };
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      return {
        user,
        accessToken: 'demo-token',
        refreshToken: 'demo-refresh',
      };
    }

    const { axiosClient } = await import('./axiosClient');
    const response = await axiosClient.post<{ success: boolean; data: LoginResponse }>('/auth/Login', {
      email,
      password,
    });
    const { accessToken, refreshToken, user } = response.data.data;
    if (accessToken) await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
    if (user) await SecureStore.setItemAsync('user', JSON.stringify(user));
    return response.data.data;
  },

  async logout() {
    if (DEMO_MODE) {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      return;
    }
    try {
      const { axiosClient } = await import('./axiosClient');
      await axiosClient.post('/auth/Logout');
    } catch (_) {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  },
};

