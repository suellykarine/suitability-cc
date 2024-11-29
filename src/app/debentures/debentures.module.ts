import { Module } from '@nestjs/common';
import { DebentureSerieService } from './debentures-serie.service';
import { DebenturesController } from './debentures.controller';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { PrismaDebentureSerieRepositorio } from 'src/repositorios/prisma/prismaDebentureSerieRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { PrismaDebentureRepositorio } from 'src/repositorios/prisma/prismaDebentureRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { PrismaDebentureSerieInvestidorRepositorio } from 'src/repositorios/prisma/prismadebentureSerieInvestidorRepositorio';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { PrismaContaInvestidorRepositorio } from 'src/repositorios/prisma/prismaContaInvestidorRepositorio';
import { DebentureService } from './debentures.service';
import { ConfigService } from '@nestjs/config';
import { SrmBankService } from '../srm-bank/srm-bank.service';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { PrismaAdaptadorDb } from 'src/adaptadores/db/prismaAdaptadorDb';
import { CreditSecModule } from '../credit-sec/credit-sec.module';
import { LaqusModule } from '../laqus/laqus.module';

@Module({
  imports: [CreditSecModule, LaqusModule],
  controllers: [DebenturesController],
  providers: [
    DebentureSerieService,
    PrismaService,
    DebentureService,
    ConfigService,
    SrmBankService,
    {
      provide: DebentureSerieRepositorio,
      useClass: PrismaDebentureSerieRepositorio,
    },
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
    {
      provide: DebentureRepositorio,
      useClass: PrismaDebentureRepositorio,
    },
    {
      provide: DebentureSerieInvestidorRepositorio,
      useClass: PrismaDebentureSerieInvestidorRepositorio,
    },
    {
      provide: ContaInvestidorRepositorio,
      useClass: PrismaContaInvestidorRepositorio,
    },
    {
      provide: AdaptadorDb,
      useClass: PrismaAdaptadorDb,
    },
  ],
  exports: [DebentureService, DebentureSerieService],
})
export class DebenturesModule {}
