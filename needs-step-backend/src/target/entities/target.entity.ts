import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { MeasureTarget } from './measuare-target.entity';

@InputType('TargetInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Target extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.targets, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((target: Target) => target.user)
  userId: number;

  @Field((type) => [MeasureTarget])
  @OneToMany((type) => MeasureTarget, (measureTarget) => measureTarget.target)
  measureTargets: MeasureTarget[];

  @Field((type) => String)
  @Column()
  @IsString()
  date: string;
}
