import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationLetterModule } from './invitation-letter/invitation-letter.module';
import { PreRegisterModule } from './pre-register/pre-register.module';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivesModule } from './actives/actives.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [AuthModule, UsersModule, InvitationLetterModule, PreRegisterModule, ActivesModule, PdfModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthorizationInterceptor,
    },
  ],
})
export class AppModule {}
