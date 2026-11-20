import { DeleteUserCommand } from '../../command/delete-user.command.js';

export abstract class DeleteUserUseCase {
  abstract delete(command: DeleteUserCommand): Promise<void>;
}
