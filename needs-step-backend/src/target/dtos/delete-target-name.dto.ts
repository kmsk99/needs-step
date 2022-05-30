import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteTargetNameInput {
  @Field((type) => Number)
  targetNameId: number;
}

@ObjectType()
export class DeleteTargetNameOutput extends CoreOutput {}
