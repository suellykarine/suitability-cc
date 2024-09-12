import { Test, TestingModule } from '@nestjs/testing';
import { CcbService } from './ccb.service';

describe('CcbService', () => {
  let service: CcbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CcbService],
    }).compile();

    service = module.get<CcbService>(CcbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
