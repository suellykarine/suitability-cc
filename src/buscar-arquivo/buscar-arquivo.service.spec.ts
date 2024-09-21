import { Test, TestingModule } from '@nestjs/testing';
import { BuscarArquivoService } from './buscar-arquivo.service';

describe('BuscarArquivoService', () => {
  let service: BuscarArquivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuscarArquivoService],
    }).compile();

    service = module.get<BuscarArquivoService>(BuscarArquivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
