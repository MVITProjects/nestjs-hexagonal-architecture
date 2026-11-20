import { User } from '../../../domain/model/user.js';
import { UpdateUserCommand } from '../../command/update-user.command.js';

export abstract class UpdateUserUseCase {
  abstract update(command: UpdateUserCommand): Promise<User>;
}
