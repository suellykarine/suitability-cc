import { Test, TestingModule } from '@nestjs/testing';
import { DebenturesController } from './debentures.controller';
import { DebentureSerieService } from './debentures-serie.service';

describe('DebenturesController', () => {
  let controller: DebenturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebenturesController],
      providers: [DebentureSerieService],
    }).compile();

    controller = module.get<DebenturesController>(DebenturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
