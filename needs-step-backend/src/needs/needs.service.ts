import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateMeasureNeedInput } from './dtos/create-measure-need.dto';
import { CreateNeedOutput } from './dtos/create-need.dto';
import { MyNeedsOutput } from './dtos/my-needs.dto';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(Need)
    private readonly needs: Repository<Need>,
    @InjectRepository(NeedQuestion)
    private readonly needQuestions: Repository<NeedQuestion>,
    @InjectRepository(MeasureNeed)
    private readonly measureNeeds: Repository<MeasureNeed>,
  ) {}

  async createNeed(
    authUser: User,
    createMeasureNeedInputs: CreateMeasureNeedInput[],
  ): Promise<CreateNeedOutput> {
    try {
      const newNeed = this.needs.create();
      newNeed.user = authUser;
      await this.needs.save(newNeed);

      for (const createMeasureNeedInput of createMeasureNeedInputs) {
        const newMeasureNeed = this.measureNeeds.create();
        const currentNeedQuestion = await this.needQuestions.findOne(
          createMeasureNeedInput.needQuestionId,
        );
        newMeasureNeed.needQuestion = currentNeedQuestion;
        newMeasureNeed.score = createMeasureNeedInput.score;
        await this.measureNeeds.save(newMeasureNeed);
      }

      return {
        ok: true,
        needId: newNeed.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create need',
      };
    }
  }

  async myNeed(authUser: User): Promise<MyNeedsOutput> {
    try {
      const needs = await this.needs.find({ user: authUser });
      return {
        ok: true,
        needs,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find my needs',
      };
    }
  }
}
