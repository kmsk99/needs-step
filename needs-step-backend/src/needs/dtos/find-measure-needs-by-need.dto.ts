import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class findMeasureNeedsByNeedInput {
  @Field((type) => Int)
  needId: number;
}
