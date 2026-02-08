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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Uygulama açılışında kayıtlı kullanıcı varsa yükle (demo veya gerçek)
  useEffect(() => {
    let cancelled = false;
    authService
      .getStoredUser()
      .then((stored) => {
        if (!cancelled && stored) setUser(stored);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Giriş durumuna göre yönlendir: giriş yoksa login, giriş varsa auth ekranındaysa dashboard
  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const hasNoSegment = !segments[0];
    const inTabs = segments[0] === '(tabs)';

    if (user == null) {
      if (!inAuthGroup && !hasNoSegment) {
        router.replace('/(auth)/login');
      } else if (hasNoSegment) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (inAuthGroup || hasNoSegment) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, navigationState?.key, isLoading]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    router.replace('/(tabs)/dashboard');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

