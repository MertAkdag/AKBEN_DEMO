import type { IAuthRepository, LoginResult } from '../../../domain/repositories/IAuthRepository';

interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    return this.authRepository.login(input.email, input.password);
  }
}

