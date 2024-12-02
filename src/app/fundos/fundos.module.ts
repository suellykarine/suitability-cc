import { Module } from '@nestjs/common';
import { FundosService } from './fundos.service';
import { FundosController } from './fundos.controller';
import { PrismaService } from 'prisma/prisma.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { CadastroPessoaJuridicaService } from '../sigma/cadastro-pessoa-juridica.service';
import { ConfigService } from '@nestjs/config';
import { ProcuradorFundoRepositorio } from 'src/repositorios/contratos/procuradorFundoRepositorio';
import { PrismaProcuradorFundoRepositorio } from 'src/repositorios/prisma/prismaProcuradorFundoRepositorio';
import { EnderecoRepositorio } from 'src/repositorios/contratos/enderecoRepositorio';
import { PrismaEnderecoRepositorio } from 'src/repositorios/prisma/prismaEnderecoRepositoio';

@Module({
  controllers: [FundosController],
  providers: [
    FundosService,
    PrismaService,
    CadastroPessoaJuridicaService,
    ConfigService,
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
    {
      provide: ProcuradorFundoRepositorio,
      useClass: PrismaProcuradorFundoRepositorio,
    },
    {
      provide: EnderecoRepositorio,
      useClass: PrismaEnderecoRepositorio,
    },
  ],
  exports: [FundosService],
})
export class FundosModule {}
