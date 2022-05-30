import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { TargetName } from '../entities/target-name.entity';

@InputType()
export class CreateTargetNameInput extends PickType(TargetName, [
  'content',
  'positive',
]) {}

@ObjectType()
export class CreateTargetNameOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  targetNameId?: number;
}
