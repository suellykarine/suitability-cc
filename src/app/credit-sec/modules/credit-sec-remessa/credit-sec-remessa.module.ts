import { forwardRef, Module } from '@nestjs/common';
import { CreditSecRemessaService } from './credit-sec-remessa.service';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { PrismaDebentureSerieRepositorio } from 'src/repositorios/prisma/prismaDebentureSerieRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { PrismaDebentureSerieInvestidorRepositorio } from 'src/repositorios/prisma/prismadebentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaOperacaoDebentureRepositorio } from 'src/repositorios/prisma/prismaOperacaoDebentureRepositorio';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';

import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { PrismaAdaptadorDb } from 'src/adaptadores/db/prismaAdaptadorDb';
import { OperacoesInvestModule } from 'src/app/operacoes-invest/operacoes-invest.module';
import { CreditSecRemessaController } from './credit-sec-remessa.controller';
import { DebenturesModule } from 'src/app/debentures/debentures.module';
import { SigmaModule } from 'src/app/sigma/sigma.module';
import { CcbModule } from 'src/app/ccb/ccb.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    OperacoesInvestModule,
    forwardRef(() => DebenturesModule),
    SigmaModule,
    CcbModule,
  ],
  controllers: [CreditSecRemessaController],
  providers: [
    ConfigService,
    CreditSecRemessaService,
    PrismaService,
    {
      provide: DebentureSerieRepositorio,
      useClass: PrismaDebentureSerieRepositorio,
    },
    {
      provide: DebentureSerieInvestidorRepositorio,
      useClass: PrismaDebentureSerieInvestidorRepositorio,
    },
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
    {
      provide: OperacaoDebentureRepositorio,
      useClass: PrismaOperacaoDebentureRepositorio,
    },
    {
      provide: AdaptadorDb,
      useClass: PrismaAdaptadorDb,
    },
  ],
  exports: [CreditSecRemessaService],
})
export class CreditSecRemessaModule {}
