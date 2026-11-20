import { User } from '../../../domain/model/user.js';
import { CreateUserCommand } from '../../command/create-user.command.js';

export abstract class CreateUserUseCase {
  abstract create(command: CreateUserCommand): Promise<User>;
}
