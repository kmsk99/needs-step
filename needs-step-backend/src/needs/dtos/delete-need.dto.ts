import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteNeedInput {
  @Field((type) => String)
  date: string;
}

@ObjectType()
export class DeleteNeedOutput extends CoreOutput {}
