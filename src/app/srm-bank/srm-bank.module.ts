import { Module } from '@nestjs/common';
import { SrmBankService } from './srm-bank.service';
import { SrmBankController } from './srm-bank.controller';
import { PrismaService } from 'prisma/prisma.service';
import { PrismaContaInvestidorRepositorio } from 'src/repositorios/prisma/prismaContaInvestidorRepositorio';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [SrmBankController],
  providers: [
    SrmBankService,
    PrismaService,
    ConfigService,
    {
      provide: ContaInvestidorRepositorio,
      useClass: PrismaContaInvestidorRepositorio,
    },
  ],
})
export class SrmBankModule {}
