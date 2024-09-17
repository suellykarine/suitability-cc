import { Test, TestingModule } from '@nestjs/testing';
import { StatusUsuarioService } from './status-usuario.service';

describe('StatusUsuarioService', () => {
  let service: StatusUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusUsuarioService],
    }).compile();

    service = module.get<StatusUsuarioService>(StatusUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
