import { InvalidEmailException } from '../exception/invalid-email.exception.js';

export interface UserPrimitives {
  id: number | null;
  email: string;
  name: string | null;
  createdAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  private constructor(
    public readonly id: number | null,
    private _email: string,
    private _name: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: { email: string; name?: string | null }): User {
    return new User(
      null,
      User.validateEmail(props.email),
      User.normalizeName(props.name),
      new Date(),
    );
  }

  static fromPrimitives(p: UserPrimitives): User {
    return new User(p.id, p.email, p.name, p.createdAt);
  }

  get email(): string {
    return this._email;
  }

  get name(): string | null {
    return this._name;
  }

  changeEmail(email: string): void {
    this._email = User.validateEmail(email);
  }

  rename(name: string | null | undefined): void {
    this._name = User.normalizeName(name);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      email: this._email,
      name: this._name,
      createdAt: this.createdAt,
    };
  }

  private static validateEmail(email: string): string {
    const value = email?.trim().toLowerCase();
    if (!value || !EMAIL_REGEX.test(value)) {
      throw new InvalidEmailException(email);
    }
    return value;
  }

  private static normalizeName(name: string | null | undefined): string | null {
    const value = name?.trim();
    return value ? value : null;
  }
}
