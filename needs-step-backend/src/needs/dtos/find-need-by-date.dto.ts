import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindNeedByDateInput {
  @Field((type) => String)
  date: string;
}
