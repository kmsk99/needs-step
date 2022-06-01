import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class DeleteAccountInput extends PickType(User, ['email']) {}

@ObjectType()
export class DeleteAccountOutput extends CoreOutput {}
