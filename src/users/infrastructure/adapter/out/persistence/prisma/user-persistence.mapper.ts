import { User } from '../../../../../domain/model/user.js';
import { UserPrismaEntity } from './user-prisma.entity.js';

export const UserPersistenceMapper = {
  toDomain(row: UserPrismaEntity): User {
    return User.fromPrimitives(row);
  },

  toPersistence(user: User): { email: string; name: string | null } {
    const { email, name } = user.toPrimitives();
    return { email, name };
  },
};
