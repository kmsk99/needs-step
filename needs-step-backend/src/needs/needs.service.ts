import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateMeasureNeedInput } from './dtos/create-measure-need.dto';
import {
  CreateNeedQuestionInput,
  CreateNeedQuestionOutput,
} from './dtos/create-need-question.dto';
import { CreateNeedOutput } from './dtos/create-need.dto';
import {
  DeleteNeedQuestionInput,
  DeleteNeedQuestionOutput,
} from './dtos/delete-nedd-question.dto';
import { DeleteNeedInput, DeleteNeedOutput } from './dtos/delete-need.dto';
import {
  EditNeedQuestionInput,
  EditNeedQuestionOutput,
} from './dtos/edit-need-question.dto';
import { FindNeedQuestionsInput } from './dtos/find-need-questions.dto';
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

  async editNeedQuestion(
    editNeedQuestionInput: EditNeedQuestionInput,
  ): Promise<EditNeedQuestionOutput> {
    try {
      const needQuestion = await this.needQuestions.findOne(
        editNeedQuestionInput.needQuestionId,
      );
      if (!needQuestion) {
        return {
          ok: false,
          error: 'Need question not found',
        };
      }
      await this.needQuestions.save([
        { id: editNeedQuestionInput.needQuestionId, ...editNeedQuestionInput },
      ]);
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
}
