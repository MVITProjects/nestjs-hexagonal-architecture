export class DeleteUserCommand {
  readonly id: number;

  constructor(props: { id: number }) {
    this.id = props.id;
  }
}
