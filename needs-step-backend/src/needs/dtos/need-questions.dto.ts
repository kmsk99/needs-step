import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { NeedQuestion } from '../entities/need-question.entity';

@ObjectType()
export class NeedQuestionsOutput extends CoreOutput {
  @Field((type) => [NeedQuestion], { nullable: true })
  needQuestions?: NeedQuestion[];
}
