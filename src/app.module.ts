import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuario.module';
import { CartaConviteModule } from './carta-convite/carta-convite.module';
import { PreRegistroModule } from './pre-registro/pre-registro.module';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PdfModule } from './pdf/pdf.module';
import { AtivosModule } from './ativos/ativos.module';
import { PainelModule } from './painel/painel.module';
import { EnviarEmailModule } from './enviar-email/enviar-email.module';
import { FundosModule } from './fundos/fundos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { AdmModule } from './adm/adm.module';

@Module({
  imports: [
    AuthModule,
    UsuariosModule,
    CartaConviteModule,
    PreRegistroModule,
    AtivosModule,
    PdfModule,
    PainelModule,
    EnviarEmailModule,
    FundosModule,
    DocumentosModule,
    AdmModule,
  ],
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
