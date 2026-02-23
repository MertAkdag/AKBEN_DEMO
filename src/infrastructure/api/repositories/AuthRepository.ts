import { authService } from '../../../Api/authService';
import type { IAuthRepository, LoginResult } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<LoginResult> {
    return authService.login(email, password);
  }

  async logout(): Promise<void> {
    await authService.logout();
  }

  async getStoredUser(): Promise<User | null> {
    return authService.getStoredUser();
  }
}

