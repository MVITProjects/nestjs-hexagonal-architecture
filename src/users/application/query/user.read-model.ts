import { User } from '../../domain/model/user.js';

export class UserReadModel {
  constructor(
    readonly id: number | null,
    readonly email: string,
    readonly name: string | null,
    readonly createdAt: Date,
  ) {}

  static fromDomain(user: User): UserReadModel {
    const p = user.toPrimitives();
    return new UserReadModel(p.id, p.email, p.name, p.createdAt);
  }
}
