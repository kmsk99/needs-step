import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import exp from 'constants';
import { async } from 'rxjs';
import { User, UserRole } from 'src/users/entities/user.entity';
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

  describe('createNeed', () => {
    const userArgs = {
      id: 1,
    } as User;

    it('success', async () => {
      needsRepository.create.mockReturnValue({
        user: userArgs,
        id: 1,
      });
      needsRepository.save.mockResolvedValue({
        user: userArgs,
        id: 1,
      });

      const result = await service.createNeed(userArgs);

      expect(needsRepository.create).toHaveBeenCalledTimes(1);
      expect(needsRepository.create).toHaveBeenCalledWith({ user: userArgs });

      expect(needsRepository.save).toHaveBeenCalledTimes(1);
      expect(needsRepository.save).toHaveBeenCalledWith({
        user: userArgs,
        id: 1,
      });

      expect(result).toEqual({
        ok: true,
        needId: 1,
      });
    });

    it('fail on exception', async () => {
      needsRepository.save.mockRejectedValue(new Error());
      const result = await service.createNeed(userArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Could not create need',
      });
    });
  });

  describe('myNeed', () => {
    const userArgs = {
      id: 1,
    } as User;
    const needArgs = {
      id: 1,
    } as Need;

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
    const userArgs = {
      id: 1,
    } as User;
    const deleteNeedInput = {
      needId: 1,
    };

    it('success', async () => {
      const needArgs = {
        id: 1,
        userId: 1,
      } as Need;
      needsRepository.findOne.mockResolvedValue(needArgs);
      needsRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteNeed(userArgs, deleteNeedInput);

      expect(needsRepository.findOne).toBeCalledWith(deleteNeedInput.needId);
      expect(needsRepository.findOne).toBeCalledTimes(1);

      expect(needsRepository.delete).toBeCalledTimes(1);
      expect(needsRepository.delete).toBeCalledWith(deleteNeedInput.needId);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('need not found', async () => {
      needsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.deleteNeed(userArgs, deleteNeedInput);

      expect(needsRepository.findOne).toBeCalledWith(deleteNeedInput.needId);
      expect(needsRepository.findOne).toBeCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: 'Need not found',
      });
    });

    it('dont own need', async () => {
      const needArgs = {
        id: 1,
        userId: 2,
      } as Need;

      needsRepository.findOne.mockResolvedValue(needArgs);

      const result = await service.deleteNeed(userArgs, deleteNeedInput);

      expect(needsRepository.findOne).toBeCalledWith(deleteNeedInput.needId);
      expect(needsRepository.findOne).toBeCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: "You can't delete a need that you dont't own",
      });
    });

    it('fail on exception', async () => {
      needsRepository.findOne.mockRejectedValue(new Error());

      const result = await service.deleteNeed(userArgs, deleteNeedInput);

      expect(needsRepository.findOne).toBeCalledWith(deleteNeedInput.needId);
      expect(needsRepository.findOne).toBeCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: 'Could not delete Need',
      });
    });
  });

  describe('createNeedQuestion', () => {
    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;

    it('success', async () => {
      needQuestionsRepository.save.mockResolvedValue(undefined);
      needQuestionsRepository.create.mockReturnValue(needQuestionArgs);

      const result = await service.createNeedQuestion(needQuestionArgs);

      expect(needQuestionsRepository.save).toBeCalledTimes(1);
      expect(needQuestionsRepository.save).toBeCalledWith(needQuestionArgs);

      expect(needQuestionsRepository.create).toBeCalledWith(needQuestionArgs);
      expect(needQuestionsRepository.create).toBeCalledTimes(1);

      expect(result).toEqual({ ok: true });
    });

    it('fail on exception', async () => {
      needQuestionsRepository.save.mockRejectedValue(new Error());
      needQuestionsRepository.create.mockReturnValue(needQuestionArgs);

      const result = await service.createNeedQuestion(needQuestionArgs);

      expect(needQuestionsRepository.save).toBeCalledTimes(1);
      expect(needQuestionsRepository.save).toBeCalledWith(needQuestionArgs);

      expect(needQuestionsRepository.create).toBeCalledWith(needQuestionArgs);
      expect(needQuestionsRepository.create).toBeCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: 'Could not create need question',
      });
    });
  });

  describe('allNeedQuestions', () => {
    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;

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
    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;
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
    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;
    const editNeedQuestionsInput = {
      needQuestionId: 1,
      stage: 1,
      subStage: 1,
      content: 'contents',
    };

    it('success', async () => {
      needQuestionsRepository.findOne.mockResolvedValue(needQuestionArgs);
      needQuestionsRepository.save.mockResolvedValue(undefined);

      const result = await service.editNeedQuestion(editNeedQuestionsInput);

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
      });

      expect(result).toEqual({ ok: true });
    });

    it('need question not found', async () => {
      needQuestionsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editNeedQuestion(editNeedQuestionsInput);

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

      const result = await service.editNeedQuestion(editNeedQuestionsInput);

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
    const needQuestionArgs = {
      stage: 1,
      subStage: 1,
      content: 'contents',
    } as NeedQuestion;
    const deleteNeedQuestionsInput = {
      needQuestionId: 1,
    };

    it('success', async () => {
      needQuestionsRepository.findOne.mockResolvedValue(needQuestionArgs);
      needQuestionsRepository.delete.mockResolvedValue(
        deleteNeedQuestionsInput.needQuestionId,
      );

      const result = await service.deleteNeedQuestion(deleteNeedQuestionsInput);

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

      const result = await service.deleteNeedQuestion(deleteNeedQuestionsInput);

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

      const result = await service.deleteNeedQuestion(deleteNeedQuestionsInput);

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

  describe('createMeasureNeed', () => {
    it.todo('success');
    it.todo('measure need not found');
    it.todo('cant edit dont own');
    it.todo('fail on exception');
  });

  describe('findMeasureNeed', () => {
    it.todo('success');
    it.todo('cant find dont own');
    it.todo('fail on exception');
  });

  describe('findMeasureNeedByNeed', () => {
    it.todo('success');
    it.todo('cant find dont own');
    it.todo('fail on exception');
  });

  describe('editMeasureNeed', () => {
    it.todo('success');
    it.todo('cant edit dont own');
    it.todo('fail on exception');
  });

  describe('deleteMeasureNeed', () => {
    it.todo('success');
    it.todo('cant delete dont own');
    it.todo('fail on exception');
  });
});
