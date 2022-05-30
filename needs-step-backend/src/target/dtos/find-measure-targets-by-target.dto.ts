import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class findMeasureTargetsByTargetInput {
  @Field((type) => String)
  date: string;
}
