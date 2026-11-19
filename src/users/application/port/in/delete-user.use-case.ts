export abstract class DeleteUserUseCase {
  abstract delete(id: number): Promise<void>;
}
