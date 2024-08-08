import { Test, TestingModule } from '@nestjs/testing';
import { PreRegistroController } from './pre-registro.controller';
import { PreRegistroService } from './pre-registro.service';

describe('PreRegistroController', () => {
  let controller: PreRegistroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreRegistroController],
      providers: [PreRegistroService],
    }).compile();

    controller = module.get<PreRegistroController>(PreRegistroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
