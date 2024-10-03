import { Test, TestingModule } from '@nestjs/testing';
import { FundosService } from './fundos.service';

describe('FundosService', () => {
  let service: FundosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundosService],
    }).compile();

    service = module.get<FundosService>(FundosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
