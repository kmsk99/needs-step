import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ObjectType()
export class CreateNeedOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  needId?: number;
}
