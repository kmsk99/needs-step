import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { TargetName } from '../entities/target-name.entity';

@InputType()
export class EditTargetNameInput extends PickType(PartialType(TargetName), [
  'content',
  'positive',
]) {
  @Field((type) => Int)
  targetNameId: number;
}

@ObjectType()
export class EditTargetNameOutput extends CoreOutput {}
