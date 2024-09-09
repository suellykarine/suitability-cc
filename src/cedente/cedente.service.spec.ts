import { Test, TestingModule } from '@nestjs/testing';
import { CedenteService } from './cedente.service';

describe('CedenteService', () => {
  let service: CedenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CedenteService],
    }).compile();

    service = module.get<CedenteService>(CedenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
