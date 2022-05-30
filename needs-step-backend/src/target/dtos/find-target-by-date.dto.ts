import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindTargetByDateInput {
  @Field((type) => String)
  date: string;
}
