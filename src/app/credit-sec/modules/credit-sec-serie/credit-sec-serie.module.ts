import { forwardRef, Module } from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { CreditSecSerieController } from './credit-sec-serie.controller';
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
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { PrismaDebentureRepositorio } from 'src/repositorios/prisma/prismaDebentureRepositorio';

import { CreditSecRemessaModule } from '../credit-sec-remessa/credit-sec-remessa.module';
import { DebenturesModule } from 'src/app/debentures/debentures.module';
import { OperacoesInvestModule } from 'src/app/operacoes-invest/operacoes-invest.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    OperacoesInvestModule,
    forwardRef(() => CreditSecRemessaModule),
    forwardRef(() => DebenturesModule),
  ],
  controllers: [CreditSecSerieController],
  providers: [
    ConfigService,
    CreditSecSerieService,
    PrismaService,
    {
      provide: OperacaoDebentureRepositorio,
      useClass: PrismaOperacaoDebentureRepositorio,
    },
    {
      provide: DebentureRepositorio,
      useClass: PrismaDebentureRepositorio,
    },
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
  ],
  exports: [CreditSecSerieService],
})
export class CreditSecSerieModule {}
