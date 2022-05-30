import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { TargetName } from './target-name.entity';
import { Target } from './target.entity';

@InputType('MeasureTargetInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class MeasureTarget extends CoreEntity {
  @Field((type) => TargetName)
  @ManyToOne((type) => TargetName, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  targetName: TargetName;

  @Field((type) => Target)
  @ManyToOne((type) => Target, (target) => target.measureTargets, {
    onDelete: 'CASCADE',
  })
  target: Target;

  @RelationId((measureTarget: MeasureTarget) => measureTarget.target)
  targetId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((target: Target) => target.user)
  userId: number;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  time: number;
}
