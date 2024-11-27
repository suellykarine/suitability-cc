import { Module } from '@nestjs/common';
import { FundosService } from './fundos.service';
import { FundosController } from './fundos.controller';
import { PrismaService } from 'prisma/prisma.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';

@Module({
  controllers: [FundosController],
  providers: [
    FundosService,
    PrismaService,
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
  ],
  exports: [FundosService],
})
export class FundosModule {}
