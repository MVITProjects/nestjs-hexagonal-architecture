export class UpdateUserCommand {
  readonly id: number;
  readonly email?: string;
  readonly name?: string;

  constructor(props: { id: number; email?: string; name?: string }) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
  }
}
