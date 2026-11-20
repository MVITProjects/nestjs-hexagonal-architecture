import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateUserCommand } from '../../../../application/command/create-user.command.js';
import { DeleteUserCommand } from '../../../../application/command/delete-user.command.js';
import { UpdateUserCommand } from '../../../../application/command/update-user.command.js';
import { CreateUserUseCase } from '../../../../application/port/in/create-user.use-case.js';
import { DeleteUserUseCase } from '../../../../application/port/in/delete-user.use-case.js';
import { GetUserUseCase } from '../../../../application/port/in/get-user.use-case.js';
import { ListUsersUseCase } from '../../../../application/port/in/list-users.use-case.js';
import { UpdateUserUseCase } from '../../../../application/port/in/update-user.use-case.js';
import { GetUserQuery } from '../../../../application/query/get-user.query.js';
import { ListUsersQuery } from '../../../../application/query/list-users.query.js';
import { CreateUserRequestDto } from './dto/create-user.request.dto.js';
import { UpdateUserRequestDto } from './dto/update-user.request.dto.js';
import { UserMapper } from './dto/user.mapper.js';
import { UserResponseDto } from './dto/user.response.dto.js';
import { GlobalExceptionHandler } from './global-exception.handler.js';

@Controller('users')
@UseFilters(GlobalExceptionHandler)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    const command = new CreateUserCommand({
      email: body.email,
      name: body.name,
    });
    return UserMapper.toResponse(await this.createUser.create(command));
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.listUsers.list(new ListUsersQuery());
    return users.map((u) => UserMapper.fromReadModel(u));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.getUser.getById(new GetUserQuery({ id }));
    return UserMapper.fromReadModel(user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand({
      id,
      email: body.email,
      name: body.name,
    });
    return UserMapper.toResponse(await this.updateUser.update(command));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUser.delete(new DeleteUserCommand({ id }));
  }
}
