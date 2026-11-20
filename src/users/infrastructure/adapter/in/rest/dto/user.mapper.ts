import { UserReadModel } from '../../../../../application/query/user.read-model.js';
import { User } from '../../../../../domain/model/user.js';
import { UserResponseDto } from './user.response.dto.js';

export const UserMapper = {
  toResponse(user: User): UserResponseDto {
    return user.toPrimitives();
  },
  fromReadModel(model: UserReadModel): UserResponseDto {
    return {
      id: model.id,
      email: model.email,
      name: model.name,
      createdAt: model.createdAt,
    };
  },
};
