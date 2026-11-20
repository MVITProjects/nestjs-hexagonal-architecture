import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../../../../application/port/out/user-repository.port.js';
import { User } from '../../../../../domain/model/user.js';
import { PrismaService } from '../../../../../../shared/infrastructure/config/prisma/prisma.service.js';
import { UserPersistenceMapper } from './user-persistence.mapper.js';

@Injectable()
export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const data = UserPersistenceMapper.toPersistence(user);
    const row =
      user.id === null
        ? await this.prisma.user.create({ data })
        : await this.prisma.user.update({ where: { id: user.id }, data });
    return UserPersistenceMapper.toDomain(row);
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserPersistenceMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserPersistenceMapper.toDomain(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map((row) => UserPersistenceMapper.toDomain(row));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
