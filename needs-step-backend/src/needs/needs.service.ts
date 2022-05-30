import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateMeasureNeedInput,
  CreateMeasureNeedOutput,
} from './dtos/create-measure-need.dto';
import {
  CreateNeedQuestionInput,
  CreateNeedQuestionOutput,
} from './dtos/create-need-question.dto';
import {
  DeleteMeasureNeedInput,
  DeleteMeasureNeedOutput,
} from './dtos/delete-measure-need.dto';
import {
  DeleteNeedQuestionInput,
  DeleteNeedQuestionOutput,
} from './dtos/delete-need-question.dto';
import { DeleteNeedInput, DeleteNeedOutput } from './dtos/delete-need.dto';
import {
  EditMeasureNeedInput,
  EditMeasureNeedOutput,
} from './dtos/edit-measure-need.dto';
import {
  EditNeedQuestionInput,
  EditNeedQuestionOutput,
} from './dtos/edit-need-question.dto';
import { findMeasureNeedsByNeedInput } from './dtos/find-measure-needs-by-need.dto';
import { FindMeasureNeedInput } from './dtos/find-measure-need.dto';
import { FindNeedQuestionsInput } from './dtos/find-need-questions.dto';
import { MeasureNeedOutput } from './dtos/measure-need.dto';
import { MeasureNeedsOutput } from './dtos/measure-needs.dto';
import { NeedQuestionsOutput } from './dtos/need-questions.dto';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { FindNeedByDateInput } from './dtos/find-need-by-date.dto';
import { NeedsOutput } from './dtos/needs.dto';
import { NeedOutput } from './dtos/need.dto';
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
    { date }: FindNeedByDateInput,
  ): Promise<NeedOutput> {
    try {
      const need = await this.needs.save(
        this.needs.create({
          user: authUser,
          date: date,
        }),
      );

      return {
        ok: true,
        need,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create need',
      };
    }
  }

  async myNeed(authUser: User): Promise<NeedsOutput> {
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

  async findNeedByDate(
    authUser: User,
    { date }: FindNeedByDateInput,
  ): Promise<NeedOutput> {
    try {
      const need = await this.needs.findOne({
        user: authUser,
        date,
      });

      if (!need) {
        return await this.createNeed(authUser, { date });
      }

      return {
        ok: true,
        need,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find need',
      };
    }
  }

  async deleteNeed(
    authUser: User,
    { date }: DeleteNeedInput,
  ): Promise<DeleteNeedOutput> {
    try {
      const need = await this.needs.findOne({
        date,
        user: authUser,
      });

      if (!need) {
        return {
          ok: false,
          error: 'Need not found',
        };
      }

      await this.needs.delete(need.id);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete Need',
      };
    }
  }

  async createNeedQuestion(
    authUser: User,
    createNeedQuestionInput: CreateNeedQuestionInput,
  ): Promise<CreateNeedQuestionOutput> {
    try {
      const newNeedQuestion = this.needQuestions.create({
        ...createNeedQuestionInput,
        user: authUser,
      });
      await this.needQuestions.save(newNeedQuestion);
      return {
        ok: true,
        needQuestionId: newNeedQuestion.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create need question',
      };
    }
  }

  async allNeedQuestions(): Promise<NeedQuestionsOutput> {
    try {
      const needQuestions = await this.needQuestions.find();
      return {
        ok: true,
        needQuestions,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any need questions',
      };
    }
  }

  async findNeedQuestionsByStage({
    stage,
  }: FindNeedQuestionsInput): Promise<NeedQuestionsOutput> {
    try {
      const needQuestions = await this.needQuestions.find({ stage });
      return {
        ok: true,
        needQuestions,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any need questions',
      };
    }
  }

  async editNeedQuestion(
    authUser: User,
    { needQuestionId, content, stage, subStage }: EditNeedQuestionInput,
  ): Promise<EditNeedQuestionOutput> {
    try {
      const needQuestion = await this.needQuestions.findOne(needQuestionId);
      if (!needQuestion) {
        return {
          ok: false,
          error: 'Need question not found',
        };
      }
      await this.needQuestions.save({
        id: needQuestionId,
        content,
        stage,
        subStage,
        user: authUser,
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit need question',
      };
    }
  }

  async deleteNeedQuestion({
    needQuestionId,
  }: DeleteNeedQuestionInput): Promise<DeleteNeedQuestionOutput> {
    try {
      const needQuestion = await this.needQuestions.findOne(needQuestionId);
      if (!needQuestion) {
        return {
          ok: false,
          error: 'Need question not found',
        };
      }
      await this.needQuestions.delete(needQuestionId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete need question',
      };
    }
  }

  async createMeasureNeed(
    authUser: User,
    { date, needQuestionId, score }: CreateMeasureNeedInput,
  ): Promise<CreateMeasureNeedOutput> {
    try {
      const { need } = await this.findNeedByDate(authUser, { date });

      if (!need) {
        return {
          ok: false,
          error: 'Need not found',
        };
      }

      const currentNeedQuestion = await this.needQuestions.findOne(
        needQuestionId,
      );

      if (!currentNeedQuestion) {
        return {
          ok: false,
          error: 'Need question not found',
        };
      }

      const measureNeed = this.measureNeeds.create({
        score,
        user: authUser,
        needQuestion: currentNeedQuestion,
        need: need,
      });

      await this.measureNeeds.save(measureNeed);

      return {
        ok: true,
        measureNeedId: measureNeed.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create measure need',
      };
    }
  }

  async findMeasureNeed(
    authUser: User,
    { measureNeedId }: FindMeasureNeedInput,
  ): Promise<MeasureNeedOutput> {
    try {
      const measureNeed = await this.measureNeeds.findOne(measureNeedId);

      if (!measureNeed) {
        return {
          ok: false,
          error: 'Measure need not found',
        };
      }

      if (measureNeed.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't find measure need that you dont't own",
        };
      }

      return {
        ok: true,
        measureNeed,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any measure need',
      };
    }
  }

  async findMeasureNeedsByNeed(
    authUser: User,
    { date }: findMeasureNeedsByNeedInput,
  ): Promise<MeasureNeedsOutput> {
    try {
      const currentNeed = await this.needs.findOne({
        where: { date, user: authUser },
        relations: ['measureNeeds'],
      });

      if (!currentNeed) {
        return {
          ok: false,
          error: 'Need not found',
        };
      }

      const measureNeeds = currentNeed.measureNeeds;

      return {
        ok: true,
        measureNeeds,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any measure need',
      };
    }
  }

  async editMeasureNeed(
    authUser: User,
    { measureNeedId, score }: EditMeasureNeedInput,
  ): Promise<EditMeasureNeedOutput> {
    try {
      const measureNeed = await this.measureNeeds.findOne(measureNeedId);
      if (!measureNeed) {
        return {
          ok: false,
          error: 'Measure need not found',
        };
      }

      if (measureNeed.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't edit a measure need that you dont't own",
        };
      }

      await this.measureNeeds.save({ id: measureNeedId, score });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit measure need',
      };
    }
  }

  async deleteMeasureNeed(
    authUser: User,
    { measureNeedId }: DeleteMeasureNeedInput,
  ): Promise<DeleteMeasureNeedOutput> {
    try {
      const measureNeed = await this.measureNeeds.findOne(measureNeedId);
      if (!measureNeed) {
        return {
          ok: false,
          error: 'Measure need not found',
        };
      }

      if (measureNeed.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't delete a measure need that you dont't own",
        };
      }

      await this.measureNeeds.delete(measureNeedId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete measure need',
      };
    }
  }
}
