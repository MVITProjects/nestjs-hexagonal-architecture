import { User } from '../../../domain/model/user.js';

export interface CreateUserCommand {
  email: string;
  name?: string;
}

export abstract class CreateUserUseCase {
  abstract create(command: CreateUserCommand): Promise<User>;
}
