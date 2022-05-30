import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('TargetNameInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class TargetName extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => Boolean)
  @Column()
  @IsBoolean()
  positive: boolean;

  @Field((type) => User)
  @ManyToOne((type) => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @RelationId((targetName: TargetName) => targetName.user)
  userId: number;
}
