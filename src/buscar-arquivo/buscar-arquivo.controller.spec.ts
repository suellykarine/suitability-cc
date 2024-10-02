import { Test, TestingModule } from '@nestjs/testing';
import { BuscarArquivoController } from './buscar-arquivo.controller';
import { BuscarArquivoService } from './buscar-arquivo.service';

describe('BuscarArquivoController', () => {
  let controller: BuscarArquivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuscarArquivoController],
      providers: [BuscarArquivoService],
    }).compile();

    controller = module.get<BuscarArquivoController>(BuscarArquivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
