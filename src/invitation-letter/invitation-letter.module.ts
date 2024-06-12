import { Module } from '@nestjs/common';
import { InvitationLetterService } from './invitation-letter.service';
import { InvitationLetterController } from './invitation-letter.controller';

@Module({
  controllers: [InvitationLetterController],
  providers: [InvitationLetterService],
})
export class InvitationLetterModule {}
