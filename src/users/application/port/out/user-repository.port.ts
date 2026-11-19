import { User } from '../../../domain/model/user.js';

/** Driven (out) port. Abstract class so it doubles as the Nest DI token. */
export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<User>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract delete(id: number): Promise<void>;
}
