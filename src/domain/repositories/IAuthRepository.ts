import type { User } from '../entities/User';

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  logout(): Promise<void>;
  getStoredUser(): Promise<User | null>;
}

