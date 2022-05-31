import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MeasureTarget } from './entities/measuare-target.entity';
import { TargetName } from './entities/target-name.entity';
import { Target } from './entities/target.entity';
import { TargetService } from './target.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TargetService', () => {
  let service: TargetService;
  let targetsRepository: MockRepository<Target>;
  let measureTargetsRepository: MockRepository<MeasureTarget>;
  let targetNamesRepository: MockRepository<TargetName>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetService,
        {
          provide: getRepositoryToken(Target),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(MeasureTarget),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(TargetName),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<TargetService>(TargetService);
    targetsRepository = module.get(getRepositoryToken(Target));
    measureTargetsRepository = module.get(getRepositoryToken(MeasureTarget));
    targetNamesRepository = module.get(getRepositoryToken(TargetName));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Target', () => {
    const userArgs = {
      id: 1,
    } as User;

    const dateArgs = { date: '2020-01-01' };

    const targetArgs = {
      user: userArgs,
      date: dateArgs.date,
      id: 1,
    } as Target;

    describe('createTarget', () => {
      it('success', async () => {
        targetsRepository.create.mockReturnValue(targetArgs);
        targetsRepository.save.mockResolvedValue(targetArgs);

        const result = await service.createTarget(userArgs, dateArgs);

        expect(targetsRepository.create).toHaveBeenCalledTimes(1);
        expect(targetsRepository.create).toHaveBeenCalledWith({
          user: userArgs,
          date: dateArgs.date,
        });

        expect(targetsRepository.save).toHaveBeenCalledTimes(1);
        expect(targetsRepository.save).toHaveBeenCalledWith(targetArgs);

        expect(result).toEqual({
          ok: true,
          target: targetArgs,
        });
      });

      it('fail on exception', async () => {
        targetsRepository.save.mockRejectedValue(new Error());
        const result = await service.createTarget(userArgs, dateArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create target',
        });
      });
    });

    describe('findTargetByDate', () => {
      it('success', async () => {
        targetsRepository.findOne.mockResolvedValue(targetArgs);

        const result = await service.findTargetByDate(userArgs, dateArgs);

        expect(targetsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(targetsRepository.findOne).toHaveBeenCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });

        expect(result).toEqual({
          ok: true,
          target: targetArgs,
        });
      });

      it('call createTarget', async () => {
        targetsRepository.findOne.mockResolvedValue(undefined);
        jest
          .spyOn(service, 'createTarget')
          .mockResolvedValue({ ok: true, target: targetArgs });

        const result = await service.findTargetByDate(userArgs, dateArgs);

        expect(targetsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(targetsRepository.findOne).toHaveBeenCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });

        expect(service.createTarget).toHaveBeenCalledTimes(1);
        expect(service.createTarget).toHaveBeenCalledWith(userArgs, dateArgs);

        expect(result).toEqual({
          ok: true,
          target: targetArgs,
        });
      });

      it('fail on exception', async () => {
        targetsRepository.findOne.mockRejectedValue(new Error());
        const result = await service.findTargetByDate(userArgs, dateArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find target',
        });
      });
    });

    describe('myTarget', () => {
      it('success', async () => {
        targetsRepository.find.mockResolvedValue([targetArgs]);

        const result = await service.myTarget(userArgs);

        expect(targetsRepository.find).toHaveBeenCalledTimes(1);
        expect(targetsRepository.find).toHaveBeenCalledWith({ user: userArgs });

        expect(result).toEqual({
          ok: true,
          targets: [targetArgs],
        });
      });

      it('success with no result', async () => {
        targetsRepository.find.mockResolvedValue([]);

        const result = await service.myTarget(userArgs);

        expect(targetsRepository.find).toHaveBeenCalledTimes(1);
        expect(targetsRepository.find).toHaveBeenCalledWith({ user: userArgs });

        expect(result).toEqual({
          ok: true,
          targets: [],
        });
      });

      it('fail on exception', async () => {
        targetsRepository.find.mockRejectedValue(new Error());

        const result = await service.myTarget(userArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find my targets',
        });
      });
    });

    describe('deleteTarget', () => {
      it('success', async () => {
        targetsRepository.findOne.mockResolvedValue(targetArgs);
        targetsRepository.delete.mockResolvedValue(undefined);

        const result = await service.deleteTarget(userArgs, dateArgs);

        expect(targetsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(targetsRepository.delete).toBeCalledWith(targetArgs.id);
        expect(targetsRepository.delete).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: true,
        });
      });

      it('target not found', async () => {
        targetsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteTarget(userArgs, dateArgs);

        expect(targetsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Target not found',
        });
      });

      it('fail on exception', async () => {
        targetsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteTarget(userArgs, dateArgs);

        expect(targetsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete target',
        });
      });
    });
  });

  describe('TargetName', () => {
    const userArgs = {
      id: 1,
    } as User;

    const targetNameArgs = {
      positive: true,
      content: 'contents',
      userId: 1,
    } as TargetName;

    const otherUserArgs = {
      id: 2,
    } as User;

    describe('createTargetName', () => {
      const createTargetNameInput = {
        positive: true,
        content: 'contents',
      };

      it('success', async () => {
        targetNamesRepository.save.mockResolvedValue(undefined);
        targetNamesRepository.create.mockReturnValue(targetNameArgs);

        const result = await service.createTargetName(
          userArgs,
          createTargetNameInput,
        );

        expect(targetNamesRepository.create).toBeCalledWith({
          ...createTargetNameInput,
          user: userArgs,
        });
        expect(targetNamesRepository.create).toBeCalledTimes(1);

        expect(targetNamesRepository.save).toBeCalledTimes(1);
        expect(targetNamesRepository.save).toBeCalledWith(targetNameArgs);

        expect(result).toEqual({ ok: true });
      });

      it('fail on exception', async () => {
        targetNamesRepository.save.mockRejectedValue(new Error());
        targetNamesRepository.create.mockReturnValue(targetNameArgs);

        const result = await service.createTargetName(
          userArgs,
          createTargetNameInput,
        );

        expect(targetNamesRepository.save).toBeCalledTimes(1);
        expect(targetNamesRepository.save).toBeCalledWith(targetNameArgs);

        expect(targetNamesRepository.create).toBeCalledWith({
          ...createTargetNameInput,
          user: userArgs,
        });
        expect(targetNamesRepository.create).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create target name',
        });
      });
    });

    describe('myTargetNames', () => {
      it('success', async () => {
        targetNamesRepository.find.mockResolvedValue([targetNameArgs]);

        const result = await service.myTargetNames(userArgs);

        expect(targetNamesRepository.find).toBeCalledTimes(1);
        expect(targetNamesRepository.find).toBeCalledWith({ user: userArgs });

        expect(result).toEqual({ ok: true, targetNames: [targetNameArgs] });
      });

      it('fail on exception', async () => {
        targetNamesRepository.find.mockRejectedValue(new Error());

        const result = await service.myTargetNames(userArgs);

        expect(targetNamesRepository.find).toBeCalledTimes(1);
        expect(targetNamesRepository.find).toBeCalledWith({ user: userArgs });

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any target names',
        });
      });
    });

    describe('editTargetName', () => {
      const editTargetNamesInput = {
        targetNameId: 1,
        positive: false,
        content: 'contents',
      };

      it('success', async () => {
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);
        targetNamesRepository.save.mockResolvedValue(undefined);

        const result = await service.editTargetName(
          userArgs,
          editTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          editTargetNamesInput.targetNameId,
        );

        expect(targetNamesRepository.save).toBeCalledTimes(1);
        expect(targetNamesRepository.save).toBeCalledWith({
          id: editTargetNamesInput.targetNameId,
          content: editTargetNamesInput.content,
          positive: editTargetNamesInput.positive,
          user: userArgs,
        });

        expect(result).toEqual({ ok: true });
      });

      it('target name not found', async () => {
        targetNamesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.editTargetName(
          userArgs,
          editTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          editTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Target name not found',
        });
      });

      it('not own target name', async () => {
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);

        const result = await service.editTargetName(
          otherUserArgs,
          editTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          editTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: "You can't edit a target name that you dont't own",
        });
      });

      it('fail on exception', async () => {
        targetNamesRepository.findOne.mockRejectedValue(new Error());

        const result = await service.editTargetName(
          userArgs,
          editTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          editTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not edit target name',
        });
      });
    });

    describe('deleteTargetName', () => {
      const deleteTargetNamesInput = {
        targetNameId: 1,
      };

      it('success', async () => {
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);
        targetNamesRepository.delete.mockResolvedValue(
          deleteTargetNamesInput.targetNameId,
        );

        const result = await service.deleteTargetName(
          userArgs,
          deleteTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          deleteTargetNamesInput.targetNameId,
        );

        expect(targetNamesRepository.delete).toBeCalledTimes(1);
        expect(targetNamesRepository.delete).toBeCalledWith(
          deleteTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({ ok: true });
      });

      it('target name not found', async () => {
        targetNamesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteTargetName(
          userArgs,
          deleteTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          deleteTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Target name not found',
        });
      });

      it('not own target name', async () => {
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);

        const result = await service.deleteTargetName(
          otherUserArgs,
          deleteTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          deleteTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: "You can't delete a target name that you dont't own",
        });
      });

      it('fail on exception', async () => {
        targetNamesRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteTargetName(
          userArgs,
          deleteTargetNamesInput,
        );

        expect(targetNamesRepository.findOne).toBeCalledTimes(1);
        expect(targetNamesRepository.findOne).toBeCalledWith(
          deleteTargetNamesInput.targetNameId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete target name',
        });
      });
    });
  });

  describe('MeasureTarget', () => {
    const userArgs = {
      id: 1,
    } as User;
    const targetNameArgs = {
      id: 1,
      userId: 1,
    } as TargetName;
    const measureTargetArgs = {
      id: 1,
      userId: 1,
    } as MeasureTarget;
    const targetArgs = {
      id: 1,
      userId: 1,
      date: '2020-01-01',
      measureTargets: [measureTargetArgs],
    } as Target;
    const otherUserArgs = {
      id: 2,
    } as User;

    describe('createMeasureTarget', () => {
      const createMeasureTargetInput = {
        date: '2020-01-01',
        targetNameId: 1,
        time: 1,
      };

      it('success', async () => {
        jest
          .spyOn(service, 'findTargetByDate')
          .mockResolvedValue({ ok: true, target: targetArgs });
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);
        measureTargetsRepository.create.mockReturnValue(measureTargetArgs);
        measureTargetsRepository.save.mockResolvedValue(undefined);

        const result = await service.createMeasureTarget(
          userArgs,
          createMeasureTargetInput,
        );

        expect(service.findTargetByDate).toBeCalledWith(userArgs, {
          date: createMeasureTargetInput.date,
        });
        expect(service.findTargetByDate).toBeCalledTimes(1);

        expect(targetNamesRepository.findOne).toBeCalledWith(
          createMeasureTargetInput.targetNameId,
        );
        expect(targetNamesRepository.findOne).toBeCalledTimes(1);

        expect(measureTargetsRepository.create).toBeCalledWith({
          time: createMeasureTargetInput.time,
          user: userArgs,
          targetName: targetNameArgs,
          target: targetArgs,
        });
        expect(measureTargetsRepository.create).toBeCalledTimes(1);

        expect(measureTargetsRepository.save).toBeCalledWith(measureTargetArgs);
        expect(measureTargetsRepository.save).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true, measureTargetId: 1 });
      });

      it('target not found', async () => {
        jest
          .spyOn(service, 'findTargetByDate')
          .mockResolvedValue({ ok: false });

        const result = await service.createMeasureTarget(
          userArgs,
          createMeasureTargetInput,
        );

        expect(service.findTargetByDate).toBeCalledWith(userArgs, {
          date: createMeasureTargetInput.date,
        });
        expect(service.findTargetByDate).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Target not found',
        });
      });

      it('Target name not found', async () => {
        jest
          .spyOn(service, 'findTargetByDate')
          .mockResolvedValue({ ok: true, target: targetArgs });
        targetNamesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.createMeasureTarget(
          userArgs,
          createMeasureTargetInput,
        );

        expect(service.findTargetByDate).toBeCalledWith(userArgs, {
          date: createMeasureTargetInput.date,
        });
        expect(service.findTargetByDate).toBeCalledTimes(1);

        expect(targetNamesRepository.findOne).toBeCalledWith(
          createMeasureTargetInput.targetNameId,
        );
        expect(targetNamesRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Target name not found',
        });
      });

      it('target name not own', async () => {
        jest
          .spyOn(service, 'findTargetByDate')
          .mockResolvedValue({ ok: true, target: targetArgs });
        targetNamesRepository.findOne.mockResolvedValue(targetNameArgs);

        const result = await service.createMeasureTarget(
          otherUserArgs,
          createMeasureTargetInput,
        );

        expect(service.findTargetByDate).toBeCalledWith(otherUserArgs, {
          date: createMeasureTargetInput.date,
        });
        expect(service.findTargetByDate).toBeCalledTimes(1);

        expect(targetNamesRepository.findOne).toBeCalledWith(
          createMeasureTargetInput.targetNameId,
        );
        expect(targetNamesRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: "You can't add a target name that you dont't own",
        });
      });

      it('fail on exception', async () => {
        jest.spyOn(service, 'findTargetByDate').mockRejectedValue(new Error());

        const result = await service.createMeasureTarget(
          userArgs,
          createMeasureTargetInput,
        );

        expect(service.findTargetByDate).toBeCalledWith(userArgs, {
          date: createMeasureTargetInput.date,
        });
        expect(service.findTargetByDate).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create measure target',
        });
      });
    });

    describe('findMeasureTarget', () => {
      const findMeasureTargetInput = {
        measureTargetId: 1,
      };

      it('success', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);

        const result = await service.findMeasureTarget(
          userArgs,
          findMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          findMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true, measureTarget: measureTargetArgs });
      });

      it('cant find measure target', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.findMeasureTarget(
          userArgs,
          findMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          findMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Measure target not found',
        });
      });

      it('cant find dont own', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);

        const result = await service.findMeasureTarget(
          otherUserArgs,
          findMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          findMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: "You can't find measure target that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureTargetsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.findMeasureTarget(
          userArgs,
          findMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          findMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any measure target',
        });
      });
    });

    describe('findMeasureTargetsByTarget', () => {
      const dateArgs = { date: '2020-01-01' };

      const queryArgs = (authUser: User, date: string) => {
        return {
          where: { date, user: authUser },
          relations: ['measureTargets'],
        };
      };

      it('success', async () => {
        targetsRepository.findOne.mockResolvedValue(targetArgs);

        const result = await service.findMeasureTargetsByTarget(
          userArgs,
          dateArgs,
        );

        expect(targetsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: true,
          measureTargets: [measureTargetArgs],
        });
      });

      it('cant find target', async () => {
        targetsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.findMeasureTargetsByTarget(
          userArgs,
          dateArgs,
        );

        expect(targetsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Target not found',
        });
      });

      it('fail on exception', async () => {
        targetsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.findMeasureTargetsByTarget(
          userArgs,
          dateArgs,
        );

        expect(targetsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(targetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any measure target',
        });
      });
    });

    describe('editMeasureTarget', () => {
      const editMeasureTargetInput = {
        measureTargetId: 1,
        time: 1,
      };

      it('success', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);
        measureTargetsRepository.save.mockResolvedValue(undefined);

        const result = await service.editMeasureTarget(
          userArgs,
          editMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          editMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(measureTargetsRepository.save).toBeCalledWith({
          id: editMeasureTargetInput.measureTargetId,
          time: editMeasureTargetInput.time,
        });
        expect(measureTargetsRepository.save).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true });
      });

      it('Measure target not found', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.editMeasureTarget(
          userArgs,
          editMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          editMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Measure target not found',
        });
      });

      it("can't edit dont't own", async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);

        const result = await service.editMeasureTarget(
          otherUserArgs,
          editMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          editMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: "You can't edit a measure target that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureTargetsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.editMeasureTarget(
          userArgs,
          editMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledWith(
          editMeasureTargetInput.measureTargetId,
        );
        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not edit measure target',
        });
      });
    });

    describe('deleteMeasureTarget', () => {
      const deleteMeasureTargetInput = {
        measureTargetId: 1,
      };

      it('success', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);
        measureTargetsRepository.delete.mockResolvedValue(undefined);

        const result = await service.deleteMeasureTarget(
          userArgs,
          deleteMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);
        expect(measureTargetsRepository.findOne).toBeCalledWith(
          deleteMeasureTargetInput.measureTargetId,
        );

        expect(measureTargetsRepository.delete).toBeCalledTimes(1);
        expect(measureTargetsRepository.delete).toBeCalledWith(
          deleteMeasureTargetInput.measureTargetId,
        );

        expect(result).toEqual({ ok: true });
      });

      it('measure target not found', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteMeasureTarget(
          userArgs,
          deleteMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);
        expect(measureTargetsRepository.findOne).toBeCalledWith(
          deleteMeasureTargetInput.measureTargetId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Measure target not found',
        });
      });

      it('cant delete dont own', async () => {
        measureTargetsRepository.findOne.mockResolvedValue(measureTargetArgs);

        const result = await service.deleteMeasureTarget(
          otherUserArgs,
          deleteMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);
        expect(measureTargetsRepository.findOne).toBeCalledWith(
          deleteMeasureTargetInput.measureTargetId,
        );

        expect(result).toEqual({
          ok: false,
          error: "You can't delete a measure target that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureTargetsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteMeasureTarget(
          userArgs,
          deleteMeasureTargetInput,
        );

        expect(measureTargetsRepository.findOne).toBeCalledTimes(1);
        expect(measureTargetsRepository.findOne).toBeCalledWith(
          deleteMeasureTargetInput.measureTargetId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete measure target',
        });
      });
    });
  });
});
