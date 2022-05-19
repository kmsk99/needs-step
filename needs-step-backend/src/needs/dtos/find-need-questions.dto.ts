import { InputType, PickType } from '@nestjs/graphql';
import { NeedQuestion } from '../entities/need-question.entity';

@InputType()
export class FindNeedQuestionsInput extends PickType(NeedQuestion, ['stage']) {}
