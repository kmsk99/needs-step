import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';
import {
  MeasureNeedResolver,
  NeedQuestionResolver,
  NeedResolver,
} from './needs.resolver';
import { NeedService } from './needs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Need, NeedQuestion, MeasureNeed])],
  providers: [
    NeedResolver,
    NeedService,
    MeasureNeedResolver,
    NeedQuestionResolver,
  ],
  exports: [NeedService],
})
export class NeedsModule {}
