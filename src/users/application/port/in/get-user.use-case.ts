import { User } from '../../../domain/model/user.js';

export abstract class GetUserUseCase {
  abstract getById(id: number): Promise<User>;
}
