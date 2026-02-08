import { axiosClient } from './axiosClient';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axiosClient.post<{ success: boolean; data: LoginResponse }>('/auth/Login', {
      email,
      password,
    });
    
    // API { success: true, data: { user, accessToken, refreshToken } } formatında dönüyor
    const { accessToken, refreshToken, user } = response.data.data;
    console.log('🔑 Access Token:', accessToken);
    console.log('🔄 Refresh Token:', refreshToken);
    if (accessToken) {
      await SecureStore.setItemAsync('accessToken', accessToken);
    }
    
    if (refreshToken) {
      await SecureStore.setItemAsync('refreshToken', refreshToken);
    }

    if (user) {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    }

    return response.data.data;
  },

  async logout() {
    try {
      await axiosClient.post('/auth/Logout');
    } catch (error) {
      console.log('Backend logout error', error);
    } finally {
      // Local temizlik
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    }
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  }
};

