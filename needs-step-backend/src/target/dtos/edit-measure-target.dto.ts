import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureTarget } from '../entities/measuare-target.entity';

@InputType()
export class EditMeasureTargetInput extends PickType(
  PartialType(MeasureTarget),
  ['time'],
) {
  @Field((type) => Int)
  measureTargetId: number;
}

@ObjectType()
export class EditMeasureTargetOutput extends CoreOutput {}
