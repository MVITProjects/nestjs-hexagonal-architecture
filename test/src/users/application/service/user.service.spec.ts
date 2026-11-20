import { CreateUserCommand } from '../../../../../src/users/application/command/create-user.command.js';
import { DeleteUserCommand } from '../../../../../src/users/application/command/delete-user.command.js';
import { UpdateUserCommand } from '../../../../../src/users/application/command/update-user.command.js';
import { GetUserQuery } from '../../../../../src/users/application/query/get-user.query.js';
import { ListUsersQuery } from '../../../../../src/users/application/query/list-users.query.js';
import { UserService } from '../../../../../src/users/application/service/user.service.js';
import { EmailAlreadyInUseException } from '../../../../../src/users/domain/exception/email-already-in-use.exception.js';
import { InvalidEmailException } from '../../../../../src/users/domain/exception/invalid-email.exception.js';
import { UserNotFoundException } from '../../../../../src/users/domain/exception/user-not-found.exception.js';
import { InMemoryUserRepositoryAdapter } from '../../infrastructure/adapter/out/persistence/in-memory/in-memory-user.repository.adapter.js';

describe('UserService', () => {
  let service: UserService;

  const create = (email: string, name?: string) =>
    service.create(new CreateUserCommand({ email, name }));

  beforeEach(() => {
    service = new UserService(new InMemoryUserRepositoryAdapter());
  });

  describe('create', () => {
    it('creates a user with a normalized email', async () => {
      const user = await create(' A@B.com ', ' Ann ');
      expect(user.id).toBe(1);
      expect(user.email).toBe('a@b.com');
      expect(user.name).toBe('Ann');
    });

    it('rejects an invalid email', async () => {
      await expect(create('nope')).rejects.toBeInstanceOf(
        InvalidEmailException,
      );
    });

    it('rejects a duplicate email', async () => {
      await create('a@b.com');
      await expect(create('a@b.com')).rejects.toBeInstanceOf(
        EmailAlreadyInUseException,
      );
    });
  });

  describe('list', () => {
    it('returns all users as read models', async () => {
      await create('a@b.com');
      await create('c@d.com');
      const users = await service.list(new ListUsersQuery());
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.email)).toEqual(['a@b.com', 'c@d.com']);
    });
  });

  describe('getById', () => {
    it('returns an existing user as a read model', async () => {
      const { id } = await create('a@b.com');
      const user = await service.getById(
        new GetUserQuery({ id: id as number }),
      );
      expect(user.id).toBe(id);
      expect(user.email).toBe('a@b.com');
    });

    it('throws when not found', async () => {
      await expect(
        service.getById(new GetUserQuery({ id: 99 })),
      ).rejects.toBeInstanceOf(UserNotFoundException);
    });
  });

  describe('update', () => {
    it('updates name and email', async () => {
      const { id } = await create('a@b.com');
      const updated = await service.update(
        new UpdateUserCommand({
          id: id as number,
          email: 'x@y.com',
          name: 'Xavi',
        }),
      );
      expect(updated.email).toBe('x@y.com');
      expect(updated.name).toBe('Xavi');
    });

    it('allows keeping the same email', async () => {
      const { id } = await create('a@b.com');
      await expect(
        service.update(
          new UpdateUserCommand({ id: id as number, email: 'a@b.com' }),
        ),
      ).resolves.toBeDefined();
    });

    it('throws when not found', async () => {
      await expect(
        service.update(new UpdateUserCommand({ id: 99, name: 'x' })),
      ).rejects.toBeInstanceOf(UserNotFoundException);
    });

    it('rejects an email used by another user', async () => {
      await create('a@b.com');
      const { id } = await create('c@d.com');
      await expect(
        service.update(
          new UpdateUserCommand({ id: id as number, email: 'a@b.com' }),
        ),
      ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    });
  });

  describe('delete', () => {
    it('deletes an existing user', async () => {
      const { id } = await create('a@b.com');
      await service.delete(new DeleteUserCommand({ id: id as number }));
      expect(await service.list(new ListUsersQuery())).toHaveLength(0);
    });

    it('throws when not found', async () => {
      await expect(
        service.delete(new DeleteUserCommand({ id: 99 })),
      ).rejects.toBeInstanceOf(UserNotFoundException);
    });
  });
});
