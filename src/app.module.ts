import { EstruturacaoCarrinhoModule } from './app/estruturacao-carrinho/estruturacao-carrinho.module';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';
import { AnalisePerfilModule } from './app/analise-perfil/analise-perfil.module';
import { StatusUsuarioModule } from './app/status-usuario/status-usuario.module';
import { BuscarArquivoModule } from './app/buscar-arquivo/buscar-arquivo.module';
import { CartaConviteModule } from './app/carta-convite/carta-convite.module';
import { PreRegistroModule } from './app/pre-registro/pre-registro.module';
import { EnviarEmailModule } from './app/enviar-email/enviar-email.module';
import { DebenturesModule } from './app/debentures/debentures.module';
import { DocumentosModule } from './app/documentos/documentos.module';
import { FeedbackModule } from './app/feedback/feedback.module';
import { UsuariosModule } from './app/usuarios/usuario.module';
import { CedenteModule } from './app/cedente/cedente.module';
import { SrmBankModule } from './srm-bank/srm-bank.module';
import { AmbimaModule } from './app/ambima/anbima.module';
import { PainelModule } from './app/painel/painel.module';
import { FundosModule } from './app/fundos/fundos.module';
import { AtivosModule } from './app/ativos/ativos.module';
import { LaqusModule } from './app/laqus/laqus.module';
import { AuthModule } from './app/auth/auth.module';
import { CcbModule } from './app/ccb/ccb.module';
import { AppController } from './app.controller';
import { AdmModule } from './app/adm/adm.module';
import { PdfModule } from './app/pdf/pdf.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    EstruturacaoCarrinhoModule,
    AnalisePerfilModule,
    BuscarArquivoModule,
    StatusUsuarioModule,
    CartaConviteModule,
    PreRegistroModule,
    EnviarEmailModule,
    DebenturesModule,
    DocumentosModule,
    UsuariosModule,
    FeedbackModule,
    SrmBankModule,
    CedenteModule,
    AtivosModule,
    PainelModule,
    FundosModule,
    AmbimaModule,
    LaqusModule,
    AuthModule,
    CcbModule,
    PdfModule,
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
