import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { TargetName } from '../entities/target-name.entity';

@ObjectType()
export class TargetNamesOutput extends CoreOutput {
  @Field((type) => [TargetName], { nullable: true })
  targetNames?: TargetName[];
}
