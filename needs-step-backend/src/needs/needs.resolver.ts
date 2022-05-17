import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateMeasureNeedInput } from './dtos/create-measure-need.dto';
import { CreateNeedOutput } from './dtos/create-need.dto';
import { MyNeedsOutput } from './dtos/my-needs.dto';
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

  // @Mutation()
  // async editNeed() {}

  // @Mutation()
  // async deleteNeed() {}
}
