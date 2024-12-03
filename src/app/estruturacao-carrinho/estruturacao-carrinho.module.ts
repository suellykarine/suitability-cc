import { Module } from '@nestjs/common';
import { EstruturacaoCarrinhoService } from './estruturacao-carrinho.service';
import { EstruturacaoCarrinhoController } from './estruturacao-carrinho.controller';
import { ConfigService } from '@nestjs/config';
import { SrmBankService } from '../srm-bank/srm-bank.service';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { PrismaContaInvestidorRepositorio } from 'src/repositorios/prisma/prismaContaInvestidorRepositorio';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [EstruturacaoCarrinhoController],
  providers: [
    EstruturacaoCarrinhoService,
    ConfigService,
    SrmBankService,
    PrismaService,
    {
      provide: ContaInvestidorRepositorio,
      useClass: PrismaContaInvestidorRepositorio,
    },
  ],
})
export class EstruturacaoCarrinhoModule {}
