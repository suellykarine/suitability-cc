import { Test, TestingModule } from '@nestjs/testing';
import { InvitationLetterController } from './invitation-letter.controller';
import { InvitationLetterService } from './invitation-letter.service';

describe('InvitationLetterController', () => {
  let controller: InvitationLetterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationLetterController],
      providers: [InvitationLetterService],
    }).compile();

    controller = module.get<InvitationLetterController>(InvitationLetterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
