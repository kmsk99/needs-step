import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { MeasureNeed } from './measure-need.entity';

@InputType('NeedInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Need extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.needs, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((need: Need) => need.user)
  userId: number;

  @Field((type) => [MeasureNeed])
  @OneToMany((type) => MeasureNeed, (measureNeed) => measureNeed.need)
  measureNeeds: MeasureNeed[];

  @Field((type) => String)
  @Column()
  @IsString()
  date: string;
}
