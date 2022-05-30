import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
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

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private readonly targets: Repository<Target>,
    @InjectRepository(TargetName)
    private readonly targetNames: Repository<TargetName>,
    @InjectRepository(MeasureTarget)
    private readonly measureTargets: Repository<MeasureTarget>,
  ) {}

  async createTarget(
    authUser: User,
    { date }: FindTargetByDateInput,
  ): Promise<TargetOutput> {
    try {
      const target = await this.targets.save(
        this.targets.create({
          user: authUser,
          date: date,
        }),
      );

      return {
        ok: true,
        target,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create target',
      };
    }
  }

  async myTarget(authUser: User): Promise<TargetsOutput> {
    try {
      const targets = await this.targets.find({ user: authUser });
      return {
        ok: true,
        targets,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find my targets',
      };
    }
  }

  async findTargetByDate(
    authUser: User,
    { date }: FindTargetByDateInput,
  ): Promise<TargetOutput> {
    try {
      const target = await this.targets.findOne({
        user: authUser,
        date,
      });

      if (!target) {
        return await this.createTarget(authUser, { date });
      }

      return {
        ok: true,
        target,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find target',
      };
    }
  }

  async deleteTarget(
    authUser: User,
    { date }: DeleteTargetInput,
  ): Promise<DeleteTargetOutput> {
    try {
      const target = await this.targets.findOne({
        date,
        user: authUser,
      });

      if (!target) {
        return {
          ok: false,
          error: 'Target not found',
        };
      }

      await this.targets.delete(target.id);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete target',
      };
    }
  }

  async createTargetName(
    authUser: User,
    { content, positive }: CreateTargetNameInput,
  ): Promise<CreateTargetNameOutput> {
    try {
      const newTargetName = this.targetNames.create({
        content,
        positive,
        user: authUser,
      });
      await this.targetNames.save(newTargetName);
      return {
        ok: true,
        targetNameId: newTargetName.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create target name',
      };
    }
  }

  async myTargetNames(authUser: User): Promise<TargetNamesOutput> {
    try {
      const targetNames = await this.targetNames.find({ user: authUser });
      return {
        ok: true,
        targetNames,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any target names',
      };
    }
  }

  async editTargetName(
    authUser: User,
    { targetNameId, content, positive }: EditTargetNameInput,
  ): Promise<EditTargetNameOutput> {
    try {
      const targetName = await this.targetNames.findOne(targetNameId);
      if (!targetName) {
        return {
          ok: false,
          error: 'Target name not found',
        };
      }
      if (targetName.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't edit a target name that you dont't own",
        };
      }
      await this.targetNames.save({
        id: targetNameId,
        content,
        positive,
        user: authUser,
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit target name',
      };
    }
  }

  async deleteTargetName(
    authUser: User,
    { targetNameId }: DeleteTargetNameInput,
  ): Promise<DeleteTargetNameOutput> {
    try {
      const targetName = await this.targetNames.findOne(targetNameId);
      if (!targetName) {
        return {
          ok: false,
          error: 'Target name not found',
        };
      }
      if (targetName.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't delete a target name that you dont't own",
        };
      }
      await this.targetNames.delete(targetNameId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete target name',
      };
    }
  }

  async createMeasureTarget(
    authUser: User,
    { date, targetNameId, time }: CreateMeasureTargetInput,
  ): Promise<CreateMeasureTargetOutput> {
    try {
      const { target } = await this.findTargetByDate(authUser, { date });

      if (!target) {
        return {
          ok: false,
          error: 'Target not found',
        };
      }

      const targetName = await this.targetNames.findOne(targetNameId);

      if (!targetName) {
        return {
          ok: false,
          error: 'Target name not found',
        };
      }

      if (target.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't add a target name that you dont't own",
        };
      }

      const measureTarget = this.measureTargets.create({
        time,
        user: authUser,
        targetName,
        target: target,
      });

      await this.measureTargets.save(measureTarget);

      return {
        ok: true,
        measureTargetId: measureTarget.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create measure target',
      };
    }
  }

  async findMeasureTarget(
    authUser: User,
    { measureTargetId }: FindMeasureTargetInput,
  ): Promise<MeasureTargetOutput> {
    try {
      const measureTarget = await this.measureTargets.findOne(measureTargetId);

      if (!measureTarget) {
        return {
          ok: false,
          error: 'Measure target not found',
        };
      }

      if (measureTarget.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't find measure target that you dont't own",
        };
      }

      return {
        ok: true,
        measureTarget,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any measure target',
      };
    }
  }

  async findMeasureTargetsByTarget(
    authUser: User,
    { date }: findMeasureTargetsByTargetInput,
  ): Promise<MeasureTargetsOutput> {
    try {
      const target = await this.targets.findOne({
        where: { date, user: authUser },
        relations: ['measureTargets'],
      });

      if (!target) {
        return {
          ok: false,
          error: 'Target not found',
        };
      }

      const measureTargets = target.measureTargets;

      return {
        ok: true,
        measureTargets,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find any measure target',
      };
    }
  }

  async editMeasureTarget(
    authUser: User,
    { measureTargetId, time }: EditMeasureTargetInput,
  ): Promise<EditMeasureTargetOutput> {
    try {
      const measureTarget = await this.measureTargets.findOne(measureTargetId);
      if (!measureTarget) {
        return {
          ok: false,
          error: 'Measure target not found',
        };
      }

      if (measureTarget.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't edit a measure target that you dont't own",
        };
      }

      await this.measureTargets.save({ id: measureTargetId, time });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit measure target',
      };
    }
  }

  async deleteMeasureTarget(
    authUser: User,
    { measureTargetId }: DeleteMeasureTargetInput,
  ): Promise<DeleteMeasureTargetOutput> {
    try {
      const measureTarget = await this.measureTargets.findOne(measureTargetId);
      if (!measureTarget) {
        return {
          ok: false,
          error: 'Measure target not found',
        };
      }

      if (measureTarget.userId !== authUser.id) {
        return {
          ok: false,
          error: "You can't delete a measure target that you dont't own",
        };
      }

      await this.measureTargets.delete(measureTargetId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete measure target',
      };
    }
  }
}
