import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
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
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';
import { NeedService } from './needs.service';

@Resolver((of) => Need)
export class NeedResolver {
  constructor(private readonly needService: NeedService) {}

  @Mutation((returns) => CreateNeedOutput)
  @Role(['Any'])
  async createNeed(
    @AuthUser() authUser: User,
    @Args({ name: 'input', type: () => [CreateMeasureNeedInput] })
    createMeasureNeedInputs: CreateMeasureNeedInput[],
  ): Promise<CreateNeedOutput> {
    return this.needService.createNeed(authUser, createMeasureNeedInputs);
  }

  @Query((returns) => MyNeedsOutput)
  @Role(['Any'])
  async myNeed(@AuthUser() authUser: User): Promise<MyNeedsOutput> {
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
