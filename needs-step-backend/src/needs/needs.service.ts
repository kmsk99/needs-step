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
import { CreateNeedOutput } from './dtos/create-need.dto';
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
import { FindMeasureNeedByNeedInput } from './dtos/find-measure-need-by-need.dto';
import { FindMeasureNeedInput } from './dtos/find-measure-need.dto';
import { FindNeedQuestionsInput } from './dtos/find-need-questions.dto';
import { MeasureNeedOutput } from './dtos/measure-need.dto';
import { MeasureNeedsOutput } from './dtos/measure-needs.dto';
import { MyNeedsOutput } from './dtos/my-needs.dto';
import { NeedQuestionsOutput } from './dtos/need-questions.dto';
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

  async createNeed(authUser: User): Promise<CreateNeedOutput> {
    try {
      const newNeed = this.needs.create({
        user: authUser,
      });
      await this.needs.save(newNeed);

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

  async deleteNeed(
    authUser: User,
    { needId }: DeleteNeedInput,
  ): Promise<DeleteNeedOutput> {
    try {
      const need = await this.needs.findOne(needId);
      if (!need) {
        return {
          ok: false,
          error: 'Need not found',
        };
      }
      if (need.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't delete a need that you dont't own",
        };
      }
      await this.needs.delete(needId);
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
    createNeedQuestionInput: CreateNeedQuestionInput,
  ): Promise<CreateNeedQuestionOutput> {
    try {
      await this.needQuestions.save(
        this.needQuestions.create({
          ...createNeedQuestionInput,
        }),
      );
      return {
        ok: true,
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

  async editNeedQuestion({
    needQuestionId,
    content,
    stage,
    subStage,
  }: EditNeedQuestionInput): Promise<EditNeedQuestionOutput> {
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
    { needId, needQuestionId, score }: CreateMeasureNeedInput,
  ): Promise<CreateMeasureNeedOutput> {
    try {
      const currentNeed = await this.needs.findOne(needId);
      if (!currentNeed) {
        return {
          ok: false,
          error: 'Need not found',
        };
      }

      if (currentNeed.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't edit a need that you dont't own",
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
        need: currentNeed,
      });
      await this.measureNeeds.save(measureNeed);

      return {
        ok: true,
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

  async findMeasureNeedByNeed(
    authUser: User,
    { needId }: FindMeasureNeedByNeedInput,
  ): Promise<MeasureNeedsOutput> {
    try {
      const currentNeed = await this.needs.findOne(needId);

      if (currentNeed.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't find need that you dont't own",
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
