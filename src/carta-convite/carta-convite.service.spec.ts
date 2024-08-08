import { Test, TestingModule } from '@nestjs/testing';
import { CartaConviteService } from './carta-convite.service';

describe('CartaConviteService', () => {
  let service: CartaConviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartaConviteService],
    }).compile();

    service = module.get<CartaConviteService>(CartaConviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
