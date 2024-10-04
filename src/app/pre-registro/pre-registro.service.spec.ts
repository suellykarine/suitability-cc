import { Test, TestingModule } from '@nestjs/testing';
import { PreRegistroService } from './pre-registro.service';

describe('PreRegistroService', () => {
  let service: PreRegistroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreRegistroService],
    }).compile();

    service = module.get<PreRegistroService>(PreRegistroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
