export class GetUserQuery {
  readonly id: number;

  constructor(props: { id: number }) {
    this.id = props.id;
  }
}
