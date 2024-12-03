import { EstruturacaoCarrinhoModule } from './app/estruturacao-carrinho/estruturacao-carrinho.module';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';
import { AnalisePerfilModule } from './app/analise-perfil/analise-perfil.module';
import { StatusUsuarioModule } from './app/status-usuario/status-usuario.module';
import { BuscarArquivoModule } from './app/buscar-arquivo/buscar-arquivo.module';
import { CartaConviteModule } from './app/carta-convite/carta-convite.module';
import { PreRegistroModule } from './app/pre-registro/pre-registro.module';
import { EnviarEmailModule } from './app/enviar-email/enviar-email.module';
import { DevelopmentModule } from './app/development/development.module';
import { DebenturesModule } from './app/debentures/debentures.module';
import { DocumentosModule } from './app/documentos/documentos.module';
import { CreditSecModule } from './app/credit-sec/credit-sec.module';
import { AuthModule } from './app/autenticacao/autenticacao.module';
import { FeedbackModule } from './app/feedback/feedback.module';
import { UsuariosModule } from './app/usuarios/usuario.module';
import { SrmBankModule } from './app/srm-bank/srm-bank.module';
import { CedenteModule } from './app/cedente/cedente.module';
import { AtivosModule } from './app/ativos/ativos.module';
import { PainelModule } from './app/painel/painel.module';
import { AnbimaModule } from './app/anbima/anbima.module';
import { FundosModule } from './app/fundos/fundos.module';
import { LaqusModule } from './app/laqus/laqus.module';
import { SigmaModule } from './app/sigma/sigma.module';
import { CcbModule } from './app/ccb/ccb.module';
import { AppController } from './app.controller';
import { AdmModule } from './app/adm/adm.module';
import { PdfModule } from './app/pdf/pdf.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongoModule } from './app/global/db/mongodb/mongo.module';
import { TratamentoExcessoesFiltro } from './helpers/filtros/filtroExcessoes';
import { LogModule } from './app/global/logs/log.module';

@Module({
  imports: [
    EstruturacaoCarrinhoModule,
    BuscarArquivoModule,
    AnalisePerfilModule,
    StatusUsuarioModule,
    CartaConviteModule,
    PreRegistroModule,
    DevelopmentModule,
    EnviarEmailModule,
    DebenturesModule,
    DocumentosModule,
    CreditSecModule,
    UsuariosModule,
    FeedbackModule,
    SrmBankModule,
    SrmBankModule,
    CedenteModule,
    AtivosModule,
    PainelModule,
    FundosModule,
    AnbimaModule,
    LaqusModule,
    SigmaModule,
    AuthModule,
    CcbModule,
    PdfModule,
    AdmModule,
    MongoModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthorizationInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: TratamentoExcessoesFiltro,
    },
  ],
})
export class AppModule {}
