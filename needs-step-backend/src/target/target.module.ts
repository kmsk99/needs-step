import { Module } from '@nestjs/common';
import { TargetResolver } from './target.resolver';
import { TargetService } from './target.service';

@Module({
  providers: [TargetResolver, TargetService]
})
export class TargetModule {}
