import { EmailAlreadyInUseException } from '../../../../../src/users/domain/exception/email-already-in-use.exception.js';
import { InvalidEmailException } from '../../../../../src/users/domain/exception/invalid-email.exception.js';
import { UserNotFoundException } from '../../../../../src/users/domain/exception/user-not-found.exception.js';
import { InMemoryUserRepositoryAdapter } from '../../infrastructure/adapter/out/persistence/in-memory/in-memory-user.repository.adapter.js';
import { UserService } from '../../../../../src/users/application/service/user.service.js';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(new InMemoryUserRepositoryAdapter());
  });

  describe('create', () => {
    it('creates a user with a normalized email', async () => {
      const user = await service.create({ email: ' A@B.com ', name: ' Ann ' });
      expect(user.id).toBe(1);
      expect(user.email).toBe('a@b.com');
      expect(user.name).toBe('Ann');
    });

    it('rejects an invalid email', async () => {
      await expect(service.create({ email: 'nope' })).rejects.toBeInstanceOf(
        InvalidEmailException,
      );
    });

    it('rejects a duplicate email', async () => {
      await service.create({ email: 'a@b.com' });
      await expect(service.create({ email: 'a@b.com' })).rejects.toBeInstanceOf(
        EmailAlreadyInUseException,
      );
    });
  });

  describe('list', () => {
    it('returns all users', async () => {
      await service.create({ email: 'a@b.com' });
      await service.create({ email: 'c@d.com' });
      expect(await service.list()).toHaveLength(2);
    });
  });

  describe('getById', () => {
    it('returns an existing user', async () => {
      const { id } = await service.create({ email: 'a@b.com' });
      expect((await service.getById(id as number)).email).toBe('a@b.com');
    });

    it('throws when not found', async () => {
      await expect(service.getById(99)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates name and email', async () => {
      const { id } = await service.create({ email: 'a@b.com' });
      const updated = await service.update(id as number, {
        email: 'x@y.com',
        name: 'Xavi',
      });
      expect(updated.email).toBe('x@y.com');
      expect(updated.name).toBe('Xavi');
    });

    it('allows keeping the same email', async () => {
      const { id } = await service.create({ email: 'a@b.com' });
      await expect(
        service.update(id as number, { email: 'a@b.com' }),
      ).resolves.toBeDefined();
    });

    it('throws when not found', async () => {
      await expect(service.update(99, { name: 'x' })).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });

    it('rejects an email used by another user', async () => {
      await service.create({ email: 'a@b.com' });
      const { id } = await service.create({ email: 'c@d.com' });
      await expect(
        service.update(id as number, { email: 'a@b.com' }),
      ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    });
  });

  describe('delete', () => {
    it('deletes an existing user', async () => {
      const { id } = await service.create({ email: 'a@b.com' });
      await service.delete(id as number);
      expect(await service.list()).toHaveLength(0);
    });

    it('throws when not found', async () => {
      await expect(service.delete(99)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });
  });
});
