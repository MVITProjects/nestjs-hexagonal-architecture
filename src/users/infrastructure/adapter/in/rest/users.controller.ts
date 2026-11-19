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
import { CreateUserUseCase } from '../../../../application/port/in/create-user.use-case.js';
import { DeleteUserUseCase } from '../../../../application/port/in/delete-user.use-case.js';
import { GetUserUseCase } from '../../../../application/port/in/get-user.use-case.js';
import { ListUsersUseCase } from '../../../../application/port/in/list-users.use-case.js';
import { UpdateUserUseCase } from '../../../../application/port/in/update-user.use-case.js';
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
    return UserMapper.toResponse(await this.createUser.create(body));
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return (await this.listUsers.list()).map((u) => UserMapper.toResponse(u));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return UserMapper.toResponse(await this.getUser.getById(id));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return UserMapper.toResponse(await this.updateUser.update(id, body));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUser.delete(id);
  }
}
