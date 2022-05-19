import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureNeed } from '../entities/measure-need.entity';

@ObjectType()
export class MeasureNeedOutput extends CoreOutput {
  @Field((type) => MeasureNeed, { nullable: true })
  measureNeed?: MeasureNeed;
}
