import { Test, TestingModule } from '@nestjs/testing';
import { PainelService } from './painel.service';

describe('PainelService', () => {
  let service: PainelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PainelService],
    }).compile();

    service = module.get<PainelService>(PainelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
