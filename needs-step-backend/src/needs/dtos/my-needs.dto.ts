import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Need } from '../entities/need.entity';

@ObjectType()
export class MyNeedsOutput extends CoreOutput {
  @Field((type) => [Need], { nullable: true })
  needs?: Need[];
}
