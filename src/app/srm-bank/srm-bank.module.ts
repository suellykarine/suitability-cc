import { Module } from '@nestjs/common';
import { SrmBankService } from './srm-bank.service';
import { SrmBankController } from './srm-bank.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [SrmBankController],
  providers: [SrmBankService, PrismaService],
})
export class SrmBankModule {}
