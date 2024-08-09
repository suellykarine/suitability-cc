import { Test, TestingModule } from '@nestjs/testing';
import { EnviarEmailController } from './enviar-email.controller';
import { EnviarEmailService } from './enviar-email.service';

describe('EnviarEmailController', () => {
  let controller: EnviarEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnviarEmailController],
      providers: [EnviarEmailService],
    }).compile();

    controller = module.get<EnviarEmailController>(EnviarEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
