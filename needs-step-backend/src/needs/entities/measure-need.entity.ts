import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { NeedQuestion } from './need-question.entity';
import { Need } from './need.entity';

@InputType('MeasureNeedInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class MeasureNeed extends CoreEntity {
  @Field((type) => NeedQuestion)
  @ManyToOne((type) => NeedQuestion, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  needQuestion: NeedQuestion;

  @Field((type) => Need)
  @ManyToOne((type) => Need, (need) => need.measureNeeds, {
    onDelete: 'CASCADE',
  })
  need: Need;

  @RelationId((measureNeed: MeasureNeed) => measureNeed.need)
  needId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((need: Need) => need.user)
  userId: number;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  score: number;
}
