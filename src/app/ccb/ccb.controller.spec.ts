import { Test, TestingModule } from '@nestjs/testing';
import { CcbController } from './ccb.controller';
import { CcbService } from './ccb.service';

describe('CcbController', () => {
  let controller: CcbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CcbController],
      providers: [CcbService],
    }).compile();

    controller = module.get<CcbController>(CcbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
