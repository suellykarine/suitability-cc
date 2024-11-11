import { Module } from '@nestjs/common';
import { AnalisePerfilService } from './analise-perfil.service';
import { AnalisePerfilController } from './analise-perfil.controller';
import { FundosService } from '../fundos/fundos.service';
import { PrismaService } from 'prisma/prisma.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';

@Module({
  controllers: [AnalisePerfilController],
  providers: [
    AnalisePerfilService,
    FundosService,
    PrismaService,
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
  ],
})
export class AnalisePerfilModule {}
