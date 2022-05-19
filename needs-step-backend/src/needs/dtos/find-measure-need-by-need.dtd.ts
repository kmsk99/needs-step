import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class FindMeasureNeedByNeedInput {
  @Field((type) => Int)
  needId: number;
}
