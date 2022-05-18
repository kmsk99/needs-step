import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { NeedQuestion } from '../entities/need-question.entity';

@InputType()
export class EditNeedQuestionInput extends PickType(PartialType(NeedQuestion), [
  'stage',
  'subStage',
  'content',
]) {
  @Field((type) => Int)
  needQuestionId: number;
}

@ObjectType()
export class EditNeedQuestionOutput extends CoreOutput {}
