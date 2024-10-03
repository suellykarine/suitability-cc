import { Test, TestingModule } from '@nestjs/testing';
import { FundosController } from './fundos.controller';
import { FundosService } from './fundos.service';

describe('FundosController', () => {
  let controller: FundosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundosController],
      providers: [FundosService],
    }).compile();

    controller = module.get<FundosController>(FundosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
