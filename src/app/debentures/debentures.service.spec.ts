import { Test, TestingModule } from '@nestjs/testing';
import { DebentureSerieService } from './debentures-serie.service';

describe('DebenturesService', () => {
  let service: DebentureSerieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebentureSerieService],
    }).compile();

    service = module.get<DebentureSerieService>(DebentureSerieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
