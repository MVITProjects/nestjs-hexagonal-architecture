export class UserNotFoundException extends Error {
  constructor(id: number) {
    super(`User #${id} not found`);
    this.name = 'UserNotFoundException';
  }
}
