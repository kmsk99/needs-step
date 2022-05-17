import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

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
}
