import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Target } from '../entities/target.entity';

@ObjectType()
export class TargetsOutput extends CoreOutput {
  @Field((type) => [Target], { nullable: true })
  targets?: Target[];
}
