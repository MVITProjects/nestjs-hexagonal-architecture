import { User } from '../../../../../domain/model/user.js';
import { UserResponseDto } from './user.response.dto.js';

export const UserMapper = {
  toResponse(user: User): UserResponseDto {
    return user.toPrimitives();
  },
};
