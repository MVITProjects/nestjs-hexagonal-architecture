import { ListUsersQuery } from '../../query/list-users.query.js';
import { UserReadModel } from '../../query/user.read-model.js';

export abstract class ListUsersUseCase {
  abstract list(query: ListUsersQuery): Promise<UserReadModel[]>;
}
