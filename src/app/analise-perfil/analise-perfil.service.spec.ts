import { Test, TestingModule } from '@nestjs/testing';
import { AnalisePerfilService } from './analise-perfil.service';

describe('AnalisePerfilService', () => {
  let service: AnalisePerfilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalisePerfilService],
    }).compile();

    service = module.get<AnalisePerfilService>(AnalisePerfilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
