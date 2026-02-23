import type { User } from '../../../domain/entities/User';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

export class GetStoredUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User | null> {
    return this.authRepository.getStoredUser();
  }
}

