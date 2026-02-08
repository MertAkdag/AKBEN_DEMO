import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { authService, User } from '../Api/authService';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

// Giriş kontrolü kapalı: Varsayılan misafir kullanıcı ile her zaman giriş yapılmış sayılır
const GUEST_USER: User = {
  id: 'guest',
  email: 'guest@local',
  name: 'Misafir',
  role: 'user',
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(GUEST_USER);
  const [isLoading, setIsLoading] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Giriş kontrolü devre dışı: Kayıtlı kullanıcı/token kontrolü yapılmıyor

  // Yönlendirme: Root layout mount olduktan sonra dashboard'a yönlendir
  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const hasNoSegment = !segments[0];

    if (inAuthGroup || hasNoSegment) {
      const t = setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 0);
      return () => clearTimeout(t);
    }
  }, [segments, navigationState?.key]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      console.log('Login response user:', response.user);
      console.log('Login response accessToken:', response.accessToken);
      console.log('Login response refreshToken:', response.refreshToken);
      setUser(response.user);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
    setUser(GUEST_USER);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

