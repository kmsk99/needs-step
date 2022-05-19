import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureNeed } from '../entities/measure-need.entity';

@InputType()
export class CreateMeasureNeedInput extends PickType(MeasureNeed, ['score']) {
  @Field((type) => Int)
  needQuestionId: number;

  @Field((type) => Int)
  needId: number;
}

@ObjectType()
export class CreateMeasureNeedOutput extends CoreOutput {}
