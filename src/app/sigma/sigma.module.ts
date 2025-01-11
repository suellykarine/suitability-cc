import { Module } from '@nestjs/common';
import { SigmaController } from './sigma.constroller';
import { PagamentoOperacaoService } from './sigma.pagamentoOperacao.service';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { PrismaContaInvestidorRepositorio } from 'src/repositorios/prisma/prismaContaInvestidorRepositorio';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { SigmaService } from './sigma.service';

@Module({
  controllers: [SigmaController],
  providers: [
    PagamentoOperacaoService,
    ConfigService,
    SigmaService,
    PrismaService,
    {
      provide: ContaInvestidorRepositorio,
      useClass: PrismaContaInvestidorRepositorio,
    },
  ],
  exports: [PagamentoOperacaoService, SigmaService],
})
export class SigmaModule {}
