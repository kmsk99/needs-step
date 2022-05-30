import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureTarget } from '../entities/measuare-target.entity';

@InputType()
export class CreateMeasureTargetInput extends PickType(MeasureTarget, [
  'time',
]) {
  @Field((type) => String)
  date: string;

  @Field((type) => Int)
  targetNameId: number;
}

@ObjectType()
export class CreateMeasureTargetOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  measureTargetId?: number;
}
