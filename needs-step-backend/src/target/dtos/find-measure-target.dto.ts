import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class FindMeasureTargetInput {
  @Field((type) => Int)
  measureTargetId: number;
}
