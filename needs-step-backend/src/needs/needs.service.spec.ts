import { Test, TestingModule } from '@nestjs/testing';
import { NeedService } from './needs.service';

describe('NeedsService', () => {
  let service: NeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeedService],
    }).compile();

    service = module.get<NeedService>(NeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
