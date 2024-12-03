import { Module } from '@nestjs/common';
import { SigmaController } from './sigma.constroller';
import { PagamentoOperacaoService } from './sigma.pagamentoOperacao.service';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { PrismaContaInvestidorRepositorio } from 'src/repositorios/prisma/prismaContaInvestidorRepositorio';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [SigmaController],
  providers: [
    PagamentoOperacaoService,
    ConfigService,
    PrismaService,
    {
      provide: ContaInvestidorRepositorio,
      useClass: PrismaContaInvestidorRepositorio,
    },
  ],
})
export class SigmaModule {}
