import { Module } from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { CreditSecRemessaService } from './credit-sec-remessa.service';
import { CreditSecControler } from './credit-sec.controller';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { PrismaDebentureSerieRepositorio } from 'src/repositorios/prisma/prismaDebentureSerieRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { PrismaDebentureSerieInvestidorRepositorio } from 'src/repositorios/prisma/prismadebentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { PrismaFundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoGestorFundoRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { PrismaUsuarioFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaUsuarioFundoInvestimento';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaOperacaoDebentureRepositorio } from 'src/repositorios/prisma/prismaOperacaoDebentureRepositorio';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';
import { SigmaService } from '../sigma/sigma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CreditSecControler],
  providers: [
    CreditSecSerieService,
    ConfigService,
    CreditSecRemessaService,
    PrismaService,
    SigmaService,
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
    {
      provide: FundoInvestimentoGestorFundoRepositorio,
      useClass: PrismaFundoInvestimentoGestorFundoRepositorio,
    },
    {
      provide: UsuarioFundoInvestimentoRepositorio,
      useClass: PrismaUsuarioFundoInvestimentoRepositorio,
    },
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
    {
      provide: OperacaoDebentureRepositorio,
      useClass: PrismaOperacaoDebentureRepositorio,
    },
  ],
  exports: [CreditSecSerieService, CreditSecRemessaService],
})
export class CreditSecModule {}
