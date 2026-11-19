import { User } from '../../../domain/model/user.js';

export interface UpdateUserCommand {
  email?: string;
  name?: string;
}

export abstract class UpdateUserUseCase {
  abstract update(id: number, command: UpdateUserCommand): Promise<User>;
}
