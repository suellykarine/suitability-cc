import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { LaqusController } from './retornoLaqus.controller';
import { RetornoLaqusService } from './retornoStatusLaqus.service';
import { Module } from '@nestjs/common';
import { PrismaDebentureSerieInvestidorRepositorio } from 'src/repositorios/prisma/prismadebentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { PrismaAdaptadorDb } from 'src/adaptadores/db/prismaAdaptadorDb';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [LaqusController],
  providers: [
    PrismaService,
    RetornoLaqusService,
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
  ],
  exports: [RetornoLaqusService],
})
export class LaqusModule {}
