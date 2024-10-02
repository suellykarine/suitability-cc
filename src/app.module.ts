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
import { CedenteModule } from './cedente/cedente.module';
import { CcbModule } from './ccb/ccb.module';
import { StatusUsuarioModule } from './status-usuario/status-usuario.module';
import { EstruturacaoCarrinhoModule } from './estruturacao-carrinho/estruturacao-carrinho.module';
import { SrmBankModule } from './srm-bank/srm-bank.module';
import { AnalisePerfilModule } from './analise-perfil/analise-perfil.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BuscarArquivoModule } from './buscar-arquivo/buscar-arquivo.module';

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
