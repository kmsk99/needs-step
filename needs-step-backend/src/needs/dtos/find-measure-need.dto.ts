import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class FindMeasureNeedInput {
  @Field((type) => Int)
  measureNeedId: number;
}
