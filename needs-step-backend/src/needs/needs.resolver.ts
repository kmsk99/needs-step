import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
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
import { FindMeasureNeedInput } from './dtos/find-measure-need.dto';
import { findMeasureNeedsByNeedInput } from './dtos/find-measure-needs-by-need.dto';
import { FindNeedByDateInput } from './dtos/find-need-by-date.dto';
import { FindNeedQuestionsInput } from './dtos/find-need-questions.dto';
import { MeasureNeedOutput } from './dtos/measure-need.dto';
import { MeasureNeedsOutput } from './dtos/measure-needs.dto';
import { NeedQuestionsOutput } from './dtos/need-questions.dto';
import { NeedOutput } from './dtos/need.dto';
import { NeedsOutput } from './dtos/needs.dto';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';
import { NeedService } from './needs.service';

@Resolver((of) => Need)
export class NeedResolver {
  constructor(private readonly needService: NeedService) {}

  @Query((returns) => NeedOutput)
  @Role(['Any'])
  async findNeedByDate(
    @AuthUser() authUser: User,
    @Args('input') findNeedByDateInput: FindNeedByDateInput,
  ): Promise<NeedOutput> {
    return this.needService.findNeedByDate(authUser, findNeedByDateInput);
  }

  @Query((returns) => NeedsOutput)
  @Role(['Any'])
  async myNeed(@AuthUser() authUser: User): Promise<NeedsOutput> {
    return this.needService.myNeed(authUser);
  }

  @Mutation((returns) => DeleteNeedOutput)
  @Role(['Any'])
  async deleteNeed(
    @AuthUser() authUser: User,
    @Args('input') deleteNeedInput: DeleteNeedInput,
  ): Promise<DeleteNeedOutput> {
    return this.needService.deleteNeed(authUser, deleteNeedInput);
  }
}

@Resolver((of) => NeedQuestion)
export class NeedQuestionResolver {
  constructor(private readonly needService: NeedService) {}

  @Mutation((returns) => CreateNeedQuestionOutput)
  @Role(['Admin'])
  async createNeedQuestion(
    @Args('input') createNeedQuestionInput: CreateNeedQuestionInput,
  ): Promise<CreateNeedQuestionOutput> {
    return this.needService.createNeedQuestion(createNeedQuestionInput);
  }

  @Query((returns) => NeedQuestionsOutput)
  @Role(['Any'])
  async allNeedQuestions(): Promise<NeedQuestionsOutput> {
    return this.needService.allNeedQuestions();
  }

  @Query((returns) => NeedQuestionsOutput)
  @Role(['Any'])
  async findNeedQuestionsByStage(
    @Args('input') findNeedQuestionsInput: FindNeedQuestionsInput,
  ): Promise<NeedQuestionsOutput> {
    return this.needService.findNeedQuestionsByStage(findNeedQuestionsInput);
  }

  @Mutation((returns) => EditNeedQuestionOutput)
  @Role(['Admin'])
  async editNeedQuestion(
    @Args('input') editNeedQuestionInput: EditNeedQuestionInput,
  ): Promise<EditNeedQuestionOutput> {
    return this.needService.editNeedQuestion(editNeedQuestionInput);
  }

  @Mutation((returns) => DeleteNeedQuestionOutput)
  @Role(['Admin'])
  async deleteNeedQuestion(
    @Args('input') deleteNeedQuestionInput: DeleteNeedQuestionInput,
  ): Promise<DeleteNeedQuestionOutput> {
    return this.needService.deleteNeedQuestion(deleteNeedQuestionInput);
  }
}

@Resolver((of) => MeasureNeed)
export class MeasureNeedResolver {
  constructor(private readonly needService: NeedService) {}

  @Mutation((returns) => CreateMeasureNeedOutput)
  @Role(['Any'])
  async createMeasureNeed(
    @AuthUser() authUser: User,
    @Args('input')
    createMeasureNeedInput: CreateMeasureNeedInput,
  ): Promise<CreateMeasureNeedOutput> {
    return this.needService.createMeasureNeed(authUser, createMeasureNeedInput);
  }

  @Query((returns) => MeasureNeedOutput)
  @Role(['Any'])
  async findMeasureNeed(
    @AuthUser() authUser: User,
    @Args('input')
    findMeasureNeedInput: FindMeasureNeedInput,
  ): Promise<MeasureNeedOutput> {
    return this.needService.findMeasureNeed(authUser, findMeasureNeedInput);
  }

  @Query((returns) => MeasureNeedsOutput)
  @Role(['Any'])
  async findMeasureNeedsByNeed(
    @AuthUser() authUser: User,
    @Args('input')
    findMeasureNeedsByNeedInput: findMeasureNeedsByNeedInput,
  ): Promise<MeasureNeedsOutput> {
    return this.needService.findMeasureNeedsByNeed(
      authUser,
      findMeasureNeedsByNeedInput,
    );
  }

  @Mutation((returns) => EditMeasureNeedOutput)
  @Role(['Any'])
  async editMeasureNeed(
    @AuthUser() authUser: User,
    @Args('input')
    editMeasureNeedInput: EditMeasureNeedInput,
  ): Promise<EditMeasureNeedOutput> {
    return this.needService.editMeasureNeed(authUser, editMeasureNeedInput);
  }

  @Mutation((returns) => DeleteMeasureNeedOutput)
  @Role(['Any'])
  async deleteMeasureNeed(
    @AuthUser() authUser: User,
    @Args('input')
    deleteMeasureNeedInput: DeleteMeasureNeedInput,
  ): Promise<DeleteMeasureNeedOutput> {
    return this.needService.deleteMeasureNeed(authUser, deleteMeasureNeedInput);
  }
}
