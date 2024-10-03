import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { UsuariosModule } from './app/usuarios/usuario.module';
import { CartaConviteModule } from './app/carta-convite/carta-convite.module';
import { PreRegistroModule } from './app/pre-registro/pre-registro.module';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PdfModule } from './app/pdf/pdf.module';
import { AtivosModule } from './app/ativos/ativos.module';
import { PainelModule } from './app/painel/painel.module';
import { EnviarEmailModule } from './app/enviar-email/enviar-email.module';
import { FundosModule } from './app/fundos/fundos.module';
import { DocumentosModule } from './app/documentos/documentos.module';
import { AdmModule } from './app/adm/adm.module';
import { CedenteModule } from './app/cedente/cedente.module';
import { CcbModule } from './app/ccb/ccb.module';
import { StatusUsuarioModule } from './app/status-usuario/status-usuario.module';
import { EstruturacaoCarrinhoModule } from './app/estruturacao-carrinho/estruturacao-carrinho.module';
import { AnalisePerfilModule } from './app/analise-perfil/analise-perfil.module';
import { FeedbackModule } from './app/feedback/feedback.module';
import { BuscarArquivoModule } from './app/buscar-arquivo/buscar-arquivo.module';
import { SrmBankModule } from './srm-bank/srm-bank.module';

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
    CedenteModule,
    CcbModule,
    StatusUsuarioModule,
    EstruturacaoCarrinhoModule,
    SrmBankModule,
    AnalisePerfilModule,
    FeedbackModule,
    BuscarArquivoModule,
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
