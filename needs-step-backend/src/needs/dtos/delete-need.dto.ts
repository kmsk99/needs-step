import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteNeedInput {
  @Field((type) => Number)
  needId: number;
}

@ObjectType()
export class DeleteNeedOutput extends CoreOutput {}
