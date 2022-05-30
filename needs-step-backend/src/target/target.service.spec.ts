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
  let targetQuestionsRepository: MockRepository<TargetName>;

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
    targetQuestionsRepository = module.get(getRepositoryToken(TargetName));
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
          error: 'Could not delete Target',
        });
      });
    });
  });
});
