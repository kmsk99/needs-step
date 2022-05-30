import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  DeleteTargetInput,
  DeleteTargetOutput,
} from './dtos/delete-target.dto';
import { FindTargetByDateInput } from './dtos/find-target-by-date.dto';
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
    private readonly targetQuestions: Repository<TargetName>,
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
        error: 'Could not delete Target',
      };
    }
  }
}
