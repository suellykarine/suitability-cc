import { Test, TestingModule } from '@nestjs/testing';
import { StatusUsuarioController } from './status-usuario.controller';
import { StatusUsuarioService } from './status-usuario.service';

describe('StatusUsuarioController', () => {
  let controller: StatusUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusUsuarioController],
      providers: [StatusUsuarioService],
    }).compile();

    controller = module.get<StatusUsuarioController>(StatusUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
