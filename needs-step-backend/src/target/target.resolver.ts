import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateMeasureTargetInput,
  CreateMeasureTargetOutput,
} from './dtos/create-measure-target.dto';
import {
  CreateTargetNameInput,
  CreateTargetNameOutput,
} from './dtos/create-target-name.dto';
import {
  DeleteMeasureTargetInput,
  DeleteMeasureTargetOutput,
} from './dtos/delete-measure-target.dto';
import {
  DeleteTargetNameInput,
  DeleteTargetNameOutput,
} from './dtos/delete-target-name.dto';
import {
  DeleteTargetInput,
  DeleteTargetOutput,
} from './dtos/delete-target.dto';
import {
  EditMeasureTargetInput,
  EditMeasureTargetOutput,
} from './dtos/edit-measure-target.dto';
import {
  EditTargetNameInput,
  EditTargetNameOutput,
} from './dtos/edit-target-name.dto';
import { FindMeasureTargetInput } from './dtos/find-measure-target.dto';
import { findMeasureTargetsByTargetInput } from './dtos/find-measure-targets-by-target.dto';
import { FindTargetByDateInput } from './dtos/find-target-by-date.dto';
import { MeasureTargetOutput } from './dtos/measure-target.dto';
import { MeasureTargetsOutput } from './dtos/measure-targets.dto';
import { TargetNamesOutput } from './dtos/target-names.dto';
import { TargetOutput } from './dtos/target.dto';
import { TargetsOutput } from './dtos/targets.dto';
import { MeasureTarget } from './entities/measuare-target.entity';
import { TargetName } from './entities/target-name.entity';
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

@Resolver((of) => TargetName)
export class TargetNameResolver {
  constructor(private readonly targetService: TargetService) {}

  @Mutation((returns) => CreateTargetNameOutput)
  @Role(['Any'])
  async createTargetName(
    @AuthUser() authUser: User,
    @Args('input') createTargetNameInput: CreateTargetNameInput,
  ): Promise<CreateTargetNameOutput> {
    return this.targetService.createTargetName(authUser, createTargetNameInput);
  }

  @Query((returns) => TargetNamesOutput)
  @Role(['Any'])
  async myTargetNames(@AuthUser() authUser: User): Promise<TargetNamesOutput> {
    return this.targetService.myTargetNames(authUser);
  }

  @Mutation((returns) => EditTargetNameOutput)
  @Role(['Any'])
  async editTargetName(
    @AuthUser() authUser: User,
    @Args('input') editTargetNameInput: EditTargetNameInput,
  ): Promise<EditTargetNameOutput> {
    return this.targetService.editTargetName(authUser, editTargetNameInput);
  }

  @Mutation((returns) => DeleteTargetNameOutput)
  @Role(['Any'])
  async deleteTargetName(
    @AuthUser() authUser: User,
    @Args('input') deleteTargetNameInput: DeleteTargetNameInput,
  ): Promise<DeleteTargetNameOutput> {
    return this.targetService.deleteTargetName(authUser, deleteTargetNameInput);
  }
}

@Resolver((of) => MeasureTarget)
export class MeasureTargetResolver {
  constructor(private readonly targetService: TargetService) {}

  @Mutation((returns) => CreateMeasureTargetOutput)
  @Role(['Any'])
  async createMeasureTarget(
    @AuthUser() authUser: User,
    @Args('input')
    createMeasureTargetInput: CreateMeasureTargetInput,
  ): Promise<CreateMeasureTargetOutput> {
    return this.targetService.createMeasureTarget(
      authUser,
      createMeasureTargetInput,
    );
  }

  @Query((returns) => MeasureTargetOutput)
  @Role(['Any'])
  async findMeasureTarget(
    @AuthUser() authUser: User,
    @Args('input')
    findMeasureTargetInput: FindMeasureTargetInput,
  ): Promise<MeasureTargetOutput> {
    return this.targetService.findMeasureTarget(
      authUser,
      findMeasureTargetInput,
    );
  }

  @Query((returns) => MeasureTargetsOutput)
  @Role(['Any'])
  async findMeasureTargetsByTarget(
    @AuthUser() authUser: User,
    @Args('input')
    findMeasureTargetsByTargetInput: findMeasureTargetsByTargetInput,
  ): Promise<MeasureTargetsOutput> {
    return this.targetService.findMeasureTargetsByTarget(
      authUser,
      findMeasureTargetsByTargetInput,
    );
  }

  @Mutation((returns) => EditMeasureTargetOutput)
  @Role(['Any'])
  async editMeasureTarget(
    @AuthUser() authUser: User,
    @Args('input')
    editMeasureTargetInput: EditMeasureTargetInput,
  ): Promise<EditMeasureTargetOutput> {
    return this.targetService.editMeasureTarget(
      authUser,
      editMeasureTargetInput,
    );
  }

  @Mutation((returns) => DeleteMeasureTargetOutput)
  @Role(['Any'])
  async deleteMeasureTarget(
    @AuthUser() authUser: User,
    @Args('input')
    deleteMeasureTargetInput: DeleteMeasureTargetInput,
  ): Promise<DeleteMeasureTargetOutput> {
    return this.targetService.deleteMeasureTarget(
      authUser,
      deleteMeasureTargetInput,
    );
  }
}
