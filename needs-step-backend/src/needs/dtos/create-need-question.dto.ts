import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { NeedQuestion } from '../entities/need-question.entity';

@InputType()
export class CreateNeedQuestionInput extends PickType(NeedQuestion, [
  'stage',
  'subStage',
  'content',
]) {}

@ObjectType()
export class CreateNeedQuestionOutput extends CoreOutput {}
