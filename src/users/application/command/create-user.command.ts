export class CreateUserCommand {
  readonly email: string;
  readonly name?: string;

  constructor(props: { email: string; name?: string }) {
    this.email = props.email;
    this.name = props.name;
  }
}
