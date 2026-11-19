import { User } from '../../../domain/model/user.js';

export abstract class ListUsersUseCase {
  abstract list(): Promise<User[]>;
}
