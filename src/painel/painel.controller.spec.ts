import { Test, TestingModule } from '@nestjs/testing';
import { PainelController } from './painel.controller';
import { PainelService } from './painel.service';

describe('PainelController', () => {
  let controller: PainelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PainelController],
      providers: [PainelService],
    }).compile();

    controller = module.get<PainelController>(PainelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
