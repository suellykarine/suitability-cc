import { Test, TestingModule } from '@nestjs/testing';
import { LaqusController } from './laqus.controller';

describe('LaqusController', () => {
  let controller: LaqusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaqusController],
    }).compile();

    controller = module.get<LaqusController>(LaqusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
