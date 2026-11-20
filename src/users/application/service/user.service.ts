import { Injectable } from '@nestjs/common';
import { EmailAlreadyInUseException } from '../../domain/exception/email-already-in-use.exception.js';
import { UserNotFoundException } from '../../domain/exception/user-not-found.exception.js';
import { User } from '../../domain/model/user.js';
import { CreateUserCommand } from '../command/create-user.command.js';
import { DeleteUserCommand } from '../command/delete-user.command.js';
import { UpdateUserCommand } from '../command/update-user.command.js';
import { CreateUserUseCase } from '../port/in/create-user.use-case.js';
import { DeleteUserUseCase } from '../port/in/delete-user.use-case.js';
import { GetUserUseCase } from '../port/in/get-user.use-case.js';
import { ListUsersUseCase } from '../port/in/list-users.use-case.js';
import { UpdateUserUseCase } from '../port/in/update-user.use-case.js';
import { UserRepositoryPort } from '../port/out/user-repository.port.js';
import { GetUserQuery } from '../query/get-user.query.js';
import { ListUsersQuery } from '../query/list-users.query.js';
import { UserReadModel } from '../query/user.read-model.js';

@Injectable()
export class UserService
  implements
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase
{
  constructor(private readonly users: UserRepositoryPort) {}

  async create(command: CreateUserCommand): Promise<User> {
    const user = User.create(command);
    if (await this.users.findByEmail(user.email)) {
      throw new EmailAlreadyInUseException(user.email);
    }
    return this.users.save(user);
  }

  async list(_query: ListUsersQuery): Promise<UserReadModel[]> {
    return (await this.users.findAll()).map((u) => UserReadModel.fromDomain(u));
  }

  async getById(query: GetUserQuery): Promise<UserReadModel> {
    return UserReadModel.fromDomain(await this.findOrFail(query.id));
  }

  async update(command: UpdateUserCommand): Promise<User> {
    const user = await this.findOrFail(command.id);

    if (command.email !== undefined) {
      user.changeEmail(command.email);
      const existing = await this.users.findByEmail(user.email);
      if (existing && existing.id !== user.id) {
        throw new EmailAlreadyInUseException(user.email);
      }
    }
    if (command.name !== undefined) user.rename(command.name);

    return this.users.save(user);
  }

  async delete(command: DeleteUserCommand): Promise<void> {
    await this.findOrFail(command.id);
    await this.users.delete(command.id);
  }

  private async findOrFail(id: number): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new UserNotFoundException(id);
    return user;
  }
}
