import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureTarget } from './entities/measuare-target.entity';
import { TargetName } from './entities/target-name.entity';
import { Target } from './entities/target.entity';
import {
  MeasureTargetResolver,
  TargetNameResolver,
  TargetResolver,
} from './target.resolver';
import { TargetService } from './target.service';

@Module({
  imports: [TypeOrmModule.forFeature([Target, TargetName, MeasureTarget])],
  providers: [
    TargetResolver,
    TargetService,
    TargetNameResolver,
    MeasureTargetResolver,
  ],
})
export class TargetModule {}
