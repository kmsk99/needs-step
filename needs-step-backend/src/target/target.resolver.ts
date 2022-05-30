import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  DeleteTargetInput,
  DeleteTargetOutput,
} from './dtos/delete-target.dto';
import { FindTargetByDateInput } from './dtos/find-target-by-date.dto';
import { TargetOutput } from './dtos/target.dto';
import { TargetsOutput } from './dtos/targets.dto';
import { Target } from './entities/target.entity';
import { TargetService } from './target.service';

@Resolver((of) => Target)
export class TargetResolver {
  constructor(private readonly targetService: TargetService) {}

  @Query((returns) => TargetOutput)
  @Role(['Any'])
  async findTargetByDate(
    @AuthUser() authUser: User,
    @Args('input') findTargetByDateInput: FindTargetByDateInput,
  ): Promise<TargetOutput> {
    return this.targetService.findTargetByDate(authUser, findTargetByDateInput);
  }

  @Query((returns) => TargetsOutput)
  @Role(['Any'])
  async myTarget(@AuthUser() authUser: User): Promise<TargetsOutput> {
    return this.targetService.myTarget(authUser);
  }

  @Mutation((returns) => DeleteTargetOutput)
  @Role(['Any'])
  async deleteTarget(
    @AuthUser() authUser: User,
    @Args('input') deleteTargetInput: DeleteTargetInput,
  ): Promise<DeleteTargetOutput> {
    return this.targetService.deleteTarget(authUser, deleteTargetInput);
  }
}
