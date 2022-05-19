import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureNeed } from '../entities/measure-need.entity';

@InputType()
export class EditMeasureNeedInput extends PickType(PartialType(MeasureNeed), [
  'score',
]) {
  @Field((type) => Int)
  measureNeedId: number;
}

@ObjectType()
export class EditMeasureNeedOutput extends CoreOutput {}
