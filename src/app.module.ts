import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationLetterModule } from './invitation-letter/invitation-letter.module';
import { PreRegisterModule } from './pre-register/pre-register.module';

@Module({
  imports: [AuthModule, UsersModule, InvitationLetterModule, PreRegisterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
