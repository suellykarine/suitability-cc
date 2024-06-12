import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationLetterModule } from './invitation-letter/invitation-letter.module';

@Module({
  imports: [AuthModule, UsersModule, InvitationLetterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
