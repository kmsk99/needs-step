import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteMeasureTargetInput {
  @Field((type) => Number)
  measureTargetId: number;
}

@ObjectType()
export class DeleteMeasureTargetOutput extends CoreOutput {}
