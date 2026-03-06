import type { IAuthRepository, LoginResult } from '../../../src/domain/repositories/IAuthRepository';
import { LoginUseCase } from '../../../src/domain/use-cases/auth/LoginUseCase';
import type { User } from '../../../src/domain/entities/User';

class MockAuthRepository implements IAuthRepository {
  constructor(private shouldFail = false) {}

  async login(email: string): Promise<LoginResult> {
    if (this.shouldFail) {
      throw new Error('Invalid credentials');
    }
    const user: User = {
      id: 'u1',
      email,
      userName: 'testuser',
      firstName: 'Test',
      lastName: 'Kullanıcı',
      name: 'Test Kullanıcı',
      role: 'ADMIN',
      roles: ['ADMIN'],
      isActive: true,
    };
    return {
      user,
      accessToken: 'access',
      refreshToken: 'refresh',
    };
  }

  async logout(): Promise<void> {
    return;
  }

  async getStoredUser(): Promise<User | null> {
    return null;
  }
}

describe('LoginUseCase', () => {
  it('başarılı girişte kullanıcı bilgisini döndürmeli', async () => {
    const useCase = new LoginUseCase(new MockAuthRepository(false));
    const result = await useCase.execute({ email: 'test@example.com', password: '123456' });
    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBe('access');
  });

  it('hatalı girişte hata fırlatmalı', async () => {
    const useCase = new LoginUseCase(new MockAuthRepository(true));
    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong' }))
      .rejects
      .toThrow('Invalid credentials');
  });
});

