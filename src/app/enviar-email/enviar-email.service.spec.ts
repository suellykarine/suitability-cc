import { Test, TestingModule } from '@nestjs/testing';
import { EnviarEmailService } from './enviar-email.service';

describe('EnviarEmailService', () => {
  let service: EnviarEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnviarEmailService],
    }).compile();

    service = module.get<EnviarEmailService>(EnviarEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
