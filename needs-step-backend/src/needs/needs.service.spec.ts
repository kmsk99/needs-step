import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';
import { NeedService } from './needs.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('NeedService', () => {
  let service: NeedService;
  let needsRepository: MockRepository<Need>;
  let measureNeedsRepository: MockRepository<MeasureNeed>;
  let needQuestionsRepository: MockRepository<NeedQuestion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeedService,
        {
          provide: getRepositoryToken(Need),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(MeasureNeed),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(NeedQuestion),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<NeedService>(NeedService);
    needsRepository = module.get(getRepositoryToken(Need));
    measureNeedsRepository = module.get(getRepositoryToken(MeasureNeed));
    needQuestionsRepository = module.get(getRepositoryToken(NeedQuestion));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Need', () => {
    const userArgs = {
      id: 1,
    } as User;

    const dateArgs = { date: '2020-01-01' };

    const needArgs = {
      user: userArgs,
      date: dateArgs.date,
      id: 1,
    } as Need;
    describe('createNeed', () => {
      it('success', async () => {
        needsRepository.create.mockReturnValue(needArgs);
        needsRepository.save.mockResolvedValue(needArgs);

        const result = await service.createNeed(userArgs, dateArgs);

        expect(needsRepository.create).toHaveBeenCalledTimes(1);
        expect(needsRepository.create).toHaveBeenCalledWith({
          user: userArgs,
          date: dateArgs.date,
        });

        expect(needsRepository.save).toHaveBeenCalledTimes(1);
        expect(needsRepository.save).toHaveBeenCalledWith(needArgs);

        expect(result).toEqual({
          ok: true,
          need: needArgs,
        });
      });

      it('fail on exception', async () => {
        needsRepository.save.mockRejectedValue(new Error());
        const result = await service.createNeed(userArgs, dateArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create need',
        });
      });
    });

    describe('findNeedByDate', () => {
      it('success', async () => {
        needsRepository.findOne.mockResolvedValue(needArgs);

        const result = await service.findNeedByDate(userArgs, dateArgs);

        expect(needsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(needsRepository.findOne).toHaveBeenCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });

        expect(result).toEqual({
          ok: true,
          need: needArgs,
        });
      });

      it('call createNeed', async () => {
        needsRepository.findOne.mockResolvedValue(undefined);
        jest
          .spyOn(service, 'createNeed')
          .mockResolvedValue({ ok: true, need: needArgs });

        const result = await service.findNeedByDate(userArgs, dateArgs);

        expect(needsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(needsRepository.findOne).toHaveBeenCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });

        expect(service.createNeed).toHaveBeenCalledTimes(1);
        expect(service.createNeed).toHaveBeenCalledWith(userArgs, dateArgs);

        expect(result).toEqual({
          ok: true,
          need: needArgs,
        });
      });

      it('fail on exception', async () => {
        needsRepository.findOne.mockRejectedValue(new Error());
        const result = await service.findNeedByDate(userArgs, dateArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find need',
        });
      });
    });

    describe('myNeed', () => {
      it('success', async () => {
        needsRepository.find.mockResolvedValue([needArgs]);

        const result = await service.myNeed(userArgs);

        expect(needsRepository.find).toHaveBeenCalledTimes(1);
        expect(needsRepository.find).toHaveBeenCalledWith({ user: userArgs });

        expect(result).toEqual({
          ok: true,
          needs: [needArgs],
        });
      });

      it('success with no result', async () => {
        needsRepository.find.mockResolvedValue([]);

        const result = await service.myNeed(userArgs);

        expect(needsRepository.find).toHaveBeenCalledTimes(1);
        expect(needsRepository.find).toHaveBeenCalledWith({ user: userArgs });

        expect(result).toEqual({
          ok: true,
          needs: [],
        });
      });

      it('fail on exception', async () => {
        needsRepository.find.mockRejectedValue(new Error());

        const result = await service.myNeed(userArgs);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find my needs',
        });
      });
    });

    describe('deleteNeed', () => {
      it('success', async () => {
        needsRepository.findOne.mockResolvedValue(needArgs);
        needsRepository.delete.mockResolvedValue(undefined);

        const result = await service.deleteNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(needsRepository.delete).toBeCalledWith(needArgs.id);
        expect(needsRepository.delete).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: true,
        });
      });

      it('need not found', async () => {
        needsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Need not found',
        });
      });

      it('fail on exception', async () => {
        needsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith({
          date: dateArgs.date,
          user: userArgs,
        });
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete need',
        });
      });
    });
  });

  describe('NeedQuestion', () => {
    const userArgs = {
      id: 1,
    } as User;

    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;

    describe('createNeedQuestion', () => {
      it('success', async () => {
        needQuestionsRepository.save.mockResolvedValue(undefined);
        needQuestionsRepository.create.mockReturnValue(needQuestionArgs);

        const result = await service.createNeedQuestion(
          userArgs,
          needQuestionArgs,
        );

        expect(needQuestionsRepository.save).toBeCalledTimes(1);
        expect(needQuestionsRepository.save).toBeCalledWith(needQuestionArgs);

        expect(needQuestionsRepository.create).toBeCalledWith({
          ...needQuestionArgs,
          user: userArgs,
        });
        expect(needQuestionsRepository.create).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true });
      });

      it('fail on exception', async () => {
        needQuestionsRepository.save.mockRejectedValue(new Error());
        needQuestionsRepository.create.mockReturnValue(needQuestionArgs);

        const result = await service.createNeedQuestion(
          userArgs,
          needQuestionArgs,
        );

        expect(needQuestionsRepository.save).toBeCalledTimes(1);
        expect(needQuestionsRepository.save).toBeCalledWith(needQuestionArgs);

        expect(needQuestionsRepository.create).toBeCalledWith({
          ...needQuestionArgs,
          user: userArgs,
        });
        expect(needQuestionsRepository.create).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create need question',
        });
      });
    });

    describe('allNeedQuestions', () => {
      it('success', async () => {
        needQuestionsRepository.find.mockResolvedValue([needQuestionArgs]);

        const result = await service.allNeedQuestions();

        expect(needQuestionsRepository.find).toBeCalledTimes(1);
        expect(needQuestionsRepository.find).toBeCalledWith();

        expect(result).toEqual({ ok: true, needQuestions: [needQuestionArgs] });
      });

      it('fail on exception', async () => {
        needQuestionsRepository.find.mockRejectedValue(new Error());

        const result = await service.allNeedQuestions();

        expect(needQuestionsRepository.find).toBeCalledTimes(1);
        expect(needQuestionsRepository.find).toBeCalledWith();

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any need questions',
        });
      });
    });

    describe('findNeedQuestionsByStage', () => {
      const findNeedQuestionsInput = {
        stage: 1,
      };

      it('success', async () => {
        needQuestionsRepository.find.mockResolvedValue([needQuestionArgs]);

        const result = await service.findNeedQuestionsByStage(
          findNeedQuestionsInput,
        );

        expect(needQuestionsRepository.find).toBeCalledTimes(1);
        expect(needQuestionsRepository.find).toBeCalledWith({
          stage: findNeedQuestionsInput.stage,
        });

        expect(result).toEqual({ ok: true, needQuestions: [needQuestionArgs] });
      });

      it('fail on exception', async () => {
        needQuestionsRepository.find.mockRejectedValue(new Error());

        const result = await service.findNeedQuestionsByStage(
          findNeedQuestionsInput,
        );

        expect(needQuestionsRepository.find).toBeCalledTimes(1);
        expect(needQuestionsRepository.find).toBeCalledWith({
          stage: findNeedQuestionsInput.stage,
        });

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any need questions',
        });
      });
    });

    describe('editNeedQuestion', () => {
      const editNeedQuestionsInput = {
        needQuestionId: 1,
        stage: 1,
        subStage: 1,
        content: 'contents',
      };

      it('success', async () => {
        needQuestionsRepository.findOne.mockResolvedValue(needQuestionArgs);
        needQuestionsRepository.save.mockResolvedValue(undefined);

        const result = await service.editNeedQuestion(
          userArgs,
          editNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          editNeedQuestionsInput.needQuestionId,
        );

        expect(needQuestionsRepository.save).toBeCalledTimes(1);
        expect(needQuestionsRepository.save).toBeCalledWith({
          id: editNeedQuestionsInput.needQuestionId,
          content: editNeedQuestionsInput.content,
          subStage: editNeedQuestionsInput.subStage,
          stage: editNeedQuestionsInput.stage,
          user: userArgs,
        });

        expect(result).toEqual({ ok: true });
      });

      it('need question not found', async () => {
        needQuestionsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.editNeedQuestion(
          userArgs,
          editNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          editNeedQuestionsInput.needQuestionId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Need question not found',
        });
      });

      it('fail on exception', async () => {
        needQuestionsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.editNeedQuestion(
          userArgs,
          editNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          editNeedQuestionsInput.needQuestionId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not edit need question',
        });
      });
    });

    describe('deleteNeedQuestion', () => {
      const deleteNeedQuestionsInput = {
        needQuestionId: 1,
      };

      it('success', async () => {
        needQuestionsRepository.findOne.mockResolvedValue(needQuestionArgs);
        needQuestionsRepository.delete.mockResolvedValue(
          deleteNeedQuestionsInput.needQuestionId,
        );

        const result = await service.deleteNeedQuestion(
          deleteNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          deleteNeedQuestionsInput.needQuestionId,
        );

        expect(needQuestionsRepository.delete).toBeCalledTimes(1);
        expect(needQuestionsRepository.delete).toBeCalledWith(
          deleteNeedQuestionsInput.needQuestionId,
        );

        expect(result).toEqual({ ok: true });
      });

      it('need question not found', async () => {
        needQuestionsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteNeedQuestion(
          deleteNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          deleteNeedQuestionsInput.needQuestionId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Need question not found',
        });
      });

      it('fail on exception', async () => {
        needQuestionsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteNeedQuestion(
          deleteNeedQuestionsInput,
        );

        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);
        expect(needQuestionsRepository.findOne).toBeCalledWith(
          deleteNeedQuestionsInput.needQuestionId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete need question',
        });
      });
    });
  });

  describe('MeasureNeed', () => {
    const userArgs = {
      id: 1,
    } as User;
    const needQustionArgs = {
      id: 1,
    } as NeedQuestion;
    const measureNeedArgs = {
      id: 1,
      userId: 1,
    } as MeasureNeed;
    const needArgs = {
      id: 1,
      userId: 1,
      date: '2020-01-01',
      measureNeeds: [measureNeedArgs],
    } as Need;
    const createMeasureNeedInput = {
      date: '2020-01-01',
      needQuestionId: 1,
      score: 1,
    };
    const otherUserArgs = {
      id: 2,
    } as User;

    describe('createMeasureNeed', () => {
      it('success', async () => {
        jest
          .spyOn(service, 'findNeedByDate')
          .mockResolvedValue({ ok: true, need: needArgs });
        needQuestionsRepository.findOne.mockResolvedValue(needQustionArgs);
        measureNeedsRepository.create.mockReturnValue(measureNeedArgs);
        measureNeedsRepository.save.mockResolvedValue(undefined);

        const result = await service.createMeasureNeed(
          userArgs,
          createMeasureNeedInput,
        );

        expect(service.findNeedByDate).toBeCalledWith(userArgs, {
          date: createMeasureNeedInput.date,
        });
        expect(service.findNeedByDate).toBeCalledTimes(1);

        expect(needQuestionsRepository.findOne).toBeCalledWith(
          createMeasureNeedInput.needQuestionId,
        );
        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);

        expect(measureNeedsRepository.create).toBeCalledWith({
          score: createMeasureNeedInput.score,
          user: userArgs,
          needQuestion: needQustionArgs,
          need: needArgs,
        });
        expect(measureNeedsRepository.create).toBeCalledTimes(1);

        expect(measureNeedsRepository.save).toBeCalledWith(measureNeedArgs);
        expect(measureNeedsRepository.save).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true, measureNeedId: 1 });
      });

      it('need not found', async () => {
        jest.spyOn(service, 'findNeedByDate').mockResolvedValue({ ok: false });

        const result = await service.createMeasureNeed(
          userArgs,
          createMeasureNeedInput,
        );

        expect(service.findNeedByDate).toBeCalledWith(userArgs, {
          date: createMeasureNeedInput.date,
        });
        expect(service.findNeedByDate).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Need not found',
        });
      });

      it('Need question not found', async () => {
        jest
          .spyOn(service, 'findNeedByDate')
          .mockResolvedValue({ ok: true, need: needArgs });
        needQuestionsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.createMeasureNeed(
          userArgs,
          createMeasureNeedInput,
        );

        expect(service.findNeedByDate).toBeCalledWith(userArgs, {
          date: createMeasureNeedInput.date,
        });
        expect(service.findNeedByDate).toBeCalledTimes(1);

        expect(needQuestionsRepository.findOne).toBeCalledWith(
          createMeasureNeedInput.needQuestionId,
        );
        expect(needQuestionsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Need question not found',
        });
      });

      it('fail on exception', async () => {
        jest.spyOn(service, 'findNeedByDate').mockRejectedValue(new Error());

        const result = await service.createMeasureNeed(
          userArgs,
          createMeasureNeedInput,
        );

        expect(service.findNeedByDate).toBeCalledWith(userArgs, {
          date: createMeasureNeedInput.date,
        });
        expect(service.findNeedByDate).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not create measure need',
        });
      });
    });

    describe('findMeasureNeed', () => {
      const findMeasureNeedInput = {
        measureNeedId: 1,
      };

      it('success', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);

        const result = await service.findMeasureNeed(
          userArgs,
          findMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          findMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true, measureNeed: measureNeedArgs });
      });

      it('cant find measure need', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.findMeasureNeed(
          userArgs,
          findMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          findMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Measure need not found',
        });
      });

      it('cant find dont own', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);

        const result = await service.findMeasureNeed(
          otherUserArgs,
          findMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          findMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: "You can't find measure need that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureNeedsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.findMeasureNeed(
          userArgs,
          findMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          findMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any measure need',
        });
      });
    });

    describe('findMeasureNeedsByNeed', () => {
      const dateArgs = { date: '2020-01-01' };

      const queryArgs = (authUser: User, date: string) => {
        return { where: { date, user: authUser }, relations: ['measureNeeds'] };
      };

      it('success', async () => {
        needsRepository.findOne.mockResolvedValue(needArgs);

        const result = await service.findMeasureNeedsByNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true, measureNeeds: [measureNeedArgs] });
      });

      it('cant find need', async () => {
        needsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.findMeasureNeedsByNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Need not found',
        });
      });

      it('fail on exception', async () => {
        needsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.findMeasureNeedsByNeed(userArgs, dateArgs);

        expect(needsRepository.findOne).toBeCalledWith(
          queryArgs(userArgs, dateArgs.date),
        );
        expect(needsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not find any measure need',
        });
      });
    });

    describe('editMeasureNeed', () => {
      const editMeasureNeedInput = {
        measureNeedId: 1,
        score: 1,
      };

      it('success', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);
        measureNeedsRepository.save.mockResolvedValue(undefined);

        const result = await service.editMeasureNeed(
          userArgs,
          editMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          editMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(measureNeedsRepository.save).toBeCalledWith({
          id: editMeasureNeedInput.measureNeedId,
          score: editMeasureNeedInput.score,
        });
        expect(measureNeedsRepository.save).toBeCalledTimes(1);

        expect(result).toEqual({ ok: true });
      });

      it('Measure need not found', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.editMeasureNeed(
          userArgs,
          editMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          editMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Measure need not found',
        });
      });

      it("can't edit dont't own", async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);

        const result = await service.editMeasureNeed(
          otherUserArgs,
          editMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          editMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: "You can't edit a measure need that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureNeedsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.editMeasureNeed(
          userArgs,
          editMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledWith(
          editMeasureNeedInput.measureNeedId,
        );
        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);

        expect(result).toEqual({
          ok: false,
          error: 'Could not edit measure need',
        });
      });
    });

    describe('deleteMeasureNeed', () => {
      const deleteMeasureNeedInput = {
        measureNeedId: 1,
      };

      it('success', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);
        measureNeedsRepository.delete.mockResolvedValue(undefined);

        const result = await service.deleteMeasureNeed(
          userArgs,
          deleteMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);
        expect(measureNeedsRepository.findOne).toBeCalledWith(
          deleteMeasureNeedInput.measureNeedId,
        );

        expect(measureNeedsRepository.delete).toBeCalledTimes(1);
        expect(measureNeedsRepository.delete).toBeCalledWith(
          deleteMeasureNeedInput.measureNeedId,
        );

        expect(result).toEqual({ ok: true });
      });

      it('measure need not found', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(undefined);

        const result = await service.deleteMeasureNeed(
          userArgs,
          deleteMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);
        expect(measureNeedsRepository.findOne).toBeCalledWith(
          deleteMeasureNeedInput.measureNeedId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Measure need not found',
        });
      });

      it('cant delete dont own', async () => {
        measureNeedsRepository.findOne.mockResolvedValue(measureNeedArgs);

        const result = await service.deleteMeasureNeed(
          otherUserArgs,
          deleteMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);
        expect(measureNeedsRepository.findOne).toBeCalledWith(
          deleteMeasureNeedInput.measureNeedId,
        );

        expect(result).toEqual({
          ok: false,
          error: "You can't delete a measure need that you dont't own",
        });
      });

      it('fail on exception', async () => {
        measureNeedsRepository.findOne.mockRejectedValue(new Error());

        const result = await service.deleteMeasureNeed(
          userArgs,
          deleteMeasureNeedInput,
        );

        expect(measureNeedsRepository.findOne).toBeCalledTimes(1);
        expect(measureNeedsRepository.findOne).toBeCalledWith(
          deleteMeasureNeedInput.measureNeedId,
        );

        expect(result).toEqual({
          ok: false,
          error: 'Could not delete measure need',
        });
      });
    });
  });
});
