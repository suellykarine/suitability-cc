import { Test, TestingModule } from '@nestjs/testing';
import { EstruturacaoCarrinhoController } from './estruturacao-carrinho.controller';
import { EstruturacaoCarrinhoService } from './estruturacao-carrinho.service';

describe('EstruturacaoCarrinhoController', () => {
  let controller: EstruturacaoCarrinhoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstruturacaoCarrinhoController],
      providers: [EstruturacaoCarrinhoService],
    }).compile();

    controller = module.get<EstruturacaoCarrinhoController>(EstruturacaoCarrinhoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
