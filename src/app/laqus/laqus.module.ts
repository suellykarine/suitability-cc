import { forwardRef, Module } from '@nestjs/common';
import { LaqusController } from './laqus.controller';
import { ConfigService } from '@nestjs/config';
import { LaqusService } from './laqus.service';
import { PrismaService } from 'prisma/prisma.service';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { PrismaDebentureSerieInvestidorRepositorio } from 'src/repositorios/prisma/prismadebentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { PrismaAdaptadorDb } from 'src/adaptadores/db/prismaAdaptadorDb';
import { CedenteModule } from '../cedente/cedente.module';
import { CreditSecModule } from '../credit-sec/credit-sec.module';
import { RepresentanteFundoRepositorio } from 'src/repositorios/contratos/representanteFundoRepositorio';
import { PrismaRepresentanteFundoRepositorio } from 'src/repositorios/prisma/prismaRepresentanteFundoRepositorio';

@Module({
  imports: [forwardRef(() => CreditSecModule), CedenteModule],
  controllers: [LaqusController],
  providers: [
    ConfigService,
    LaqusService,
    PrismaService,
    {
      provide: DebentureSerieInvestidorRepositorio,
      useClass: PrismaDebentureSerieInvestidorRepositorio,
    },
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
    {
      provide: AdaptadorDb,
      useClass: PrismaAdaptadorDb,
    },
    {
      provide: RepresentanteFundoRepositorio,
      useClass: PrismaRepresentanteFundoRepositorio,
    },
  ],
  exports: [LaqusService],
})
export class LaqusModule {}
