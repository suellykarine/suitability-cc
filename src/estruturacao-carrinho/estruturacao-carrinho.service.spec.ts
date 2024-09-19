import { Test, TestingModule } from '@nestjs/testing';
import { EstruturacaoCarrinhoService } from './estruturacao-carrinho.service';

describe('EstruturacaoCarrinhoService', () => {
  let service: EstruturacaoCarrinhoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstruturacaoCarrinhoService],
    }).compile();

    service = module.get<EstruturacaoCarrinhoService>(EstruturacaoCarrinhoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
