import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteMeasureNeedInput {
  @Field((type) => Number)
  measureNeedId: number;
}

@ObjectType()
export class DeleteMeasureNeedOutput extends CoreOutput {}
