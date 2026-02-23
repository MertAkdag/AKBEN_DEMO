import React, { PropsWithChildren, useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { lightImpact } from '../Utils/haptics';
import { useAuth } from '../features/auth/useAuth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Giriş durumuna göre yönlendir: giriş yoksa login, giriş varsa auth ekranındaysa dashboard
  useEffect(() => {
    if (!navigationState?.key || loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const hasNoSegment = !segments[0];
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    // Onboarding veya index sayfasındaysak hiçbir şey yapma (index kendi yönlendirmesini yapıyor)
    if (inOnboarding || hasNoSegment) return;

    if (user == null) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, navigationState?.key, loading, router]);

  useEffect(() => {
    if (!user) return;
    lightImpact();
  }, [user]);

  return <>{children}</>;
};

