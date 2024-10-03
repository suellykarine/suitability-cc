import { Test, TestingModule } from '@nestjs/testing';
import { AnalisePerfilController } from './analise-perfil.controller';
import { AnalisePerfilService } from './analise-perfil.service';

describe('AnalisePerfilController', () => {
  let controller: AnalisePerfilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalisePerfilController],
      providers: [AnalisePerfilService],
    }).compile();

    controller = module.get<AnalisePerfilController>(AnalisePerfilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
