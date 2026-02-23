import { useCallback, useEffect } from 'react';
import { AuthRepository } from '../../infrastructure/api/repositories/AuthRepository';
import { LoginUseCase } from '../../domain/use-cases/auth/LoginUseCase';
import { GetStoredUserUseCase } from '../../domain/use-cases/auth/GetStoredUserUseCase';
import { LogoutUseCase } from '../../domain/use-cases/auth/LogoutUseCase';
import { useAuthStore } from '../../store/auth/authStore';

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);
const getStoredUserUseCase = new GetStoredUserUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

let bootstrapped = false;

export function useAuth() {
  const { user, isAuthenticated, loading, error, setUser, setLoading, setError, clear } = useAuthStore();

  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;
    let cancelled = false;
    (async () => {
      try {
        const stored = await getStoredUserUseCase.execute();
        if (!cancelled && stored) {
          setUser(stored);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const result = await loginUseCase.execute({ email, password });
        setUser(result.user);
        return result;
      } catch (e: any) {
        setError(e?.message || 'Giriş başarısız.');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUseCase.execute();
    } finally {
      clear();
    }
  }, [clear]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}

