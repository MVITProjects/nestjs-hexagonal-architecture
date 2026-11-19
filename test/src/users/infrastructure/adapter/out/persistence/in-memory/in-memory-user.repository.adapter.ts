import { UserRepositoryPort } from '../../../../../../../../src/users/application/port/out/user-repository.port.js';
import { User } from '../../../../../../../../src/users/domain/model/user.js';

export class InMemoryUserRepositoryAdapter implements UserRepositoryPort {
  private rows = new Map<number, User>();
  private nextId = 1;

  async save(user: User): Promise<User> {
    const p = user.toPrimitives();
    const saved = User.fromPrimitives({ ...p, id: p.id ?? this.nextId++ });
    this.rows.set(saved.id as number, saved);
    return saved;
  }

  async findById(id: number): Promise<User | null> {
    return this.rows.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.rows.values()].find((u) => u.email === email) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.rows.values()];
  }

  async delete(id: number): Promise<void> {
    this.rows.delete(id);
  }
}
