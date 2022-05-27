import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureNeed } from '../entities/measure-need.entity';

@InputType()
export class CreateMeasureNeedInput extends PickType(MeasureNeed, ['score']) {
  @Field((type) => String)
  date: string;

  @Field((type) => Int)
  needQuestionId: number;
}

@ObjectType()
export class CreateMeasureNeedOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  measureNeedId?: number;
}
