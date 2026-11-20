import { GetUserQuery } from '../../query/get-user.query.js';
import { UserReadModel } from '../../query/user.read-model.js';

export abstract class GetUserUseCase {
  abstract getById(query: GetUserQuery): Promise<UserReadModel>;
}
