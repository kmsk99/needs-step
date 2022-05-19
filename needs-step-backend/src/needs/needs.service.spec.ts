import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeasureNeed } from './entities/measure-need.entity';
import { NeedQuestion } from './entities/need-question.entity';
import { Need } from './entities/need.entity';
import { NeedService } from './needs.service';

const mockRepository = () => ({
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
});
