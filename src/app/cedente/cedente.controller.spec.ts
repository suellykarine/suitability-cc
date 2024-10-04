import { Test, TestingModule } from '@nestjs/testing';
import { CedenteController } from './cedente.controller';
import { CedenteService } from './cedente.service';

describe('CedenteController', () => {
  let controller: CedenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CedenteController],
      providers: [CedenteService],
    }).compile();

    controller = module.get<CedenteController>(CedenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
