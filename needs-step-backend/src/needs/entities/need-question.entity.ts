import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('NeedQuestionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class NeedQuestion extends CoreEntity {
  @Field((type) => Number)
  @Column()
  @IsNumber()
  stage: number;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  subStage: number;

  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => User)
  @ManyToOne((type) => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @RelationId((needQuestion: NeedQuestion) => needQuestion.user)
  userId: number;
}
