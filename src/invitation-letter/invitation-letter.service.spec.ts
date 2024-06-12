import { Test, TestingModule } from '@nestjs/testing';
import { InvitationLetterService } from './invitation-letter.service';

describe('InvitationLetterService', () => {
  let service: InvitationLetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationLetterService],
    }).compile();

    service = module.get<InvitationLetterService>(InvitationLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
