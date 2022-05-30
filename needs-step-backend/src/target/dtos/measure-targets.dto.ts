import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { MeasureTarget } from '../entities/measuare-target.entity';

@ObjectType()
export class MeasureTargetsOutput extends CoreOutput {
  @Field((type) => [MeasureTarget], { nullable: true })
  measureTargets?: MeasureTarget[];
}
