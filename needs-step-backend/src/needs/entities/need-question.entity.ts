import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

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
  @Length(5, 140)
  content: string;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.needs, {
    onDelete: 'SET NULL',
  })
  user: User;
}
