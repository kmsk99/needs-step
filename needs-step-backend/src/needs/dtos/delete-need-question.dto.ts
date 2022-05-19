import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteNeedQuestionInput {
  @Field((type) => Number)
  needQuestionId: number;
}

@ObjectType()
export class DeleteNeedQuestionOutput extends CoreOutput {}
