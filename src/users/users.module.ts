import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/port/in/create-user.use-case.js';
import { DeleteUserUseCase } from './application/port/in/delete-user.use-case.js';
import { GetUserUseCase } from './application/port/in/get-user.use-case.js';
import { ListUsersUseCase } from './application/port/in/list-users.use-case.js';
import { UpdateUserUseCase } from './application/port/in/update-user.use-case.js';
import { UserRepositoryPort } from './application/port/out/user-repository.port.js';
import { UserService } from './application/service/user.service.js';
import { UsersController } from './infrastructure/adapter/in/rest/users.controller.js';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapter/out/persistence/prisma/prisma-user.repository.adapter.js';

@Module({
  controllers: [UsersController],
  providers: [
    UserService,
    { provide: CreateUserUseCase, useExisting: UserService },
    { provide: GetUserUseCase, useExisting: UserService },
    { provide: ListUsersUseCase, useExisting: UserService },
    { provide: UpdateUserUseCase, useExisting: UserService },
    { provide: DeleteUserUseCase, useExisting: UserService },
    { provide: UserRepositoryPort, useClass: PrismaUserRepositoryAdapter },
  ],
})
export class UsersModule {}
