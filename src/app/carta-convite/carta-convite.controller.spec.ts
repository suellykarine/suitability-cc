import { Test, TestingModule } from '@nestjs/testing';
import { CartaConviteController } from './carta-convite.controller';
import { CartaConviteService } from './carta-convite.service';

describe('CartaConviteController', () => {
  let controller: CartaConviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartaConviteController],
      providers: [CartaConviteService],
    }).compile();

    controller = module.get<CartaConviteController>(CartaConviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
