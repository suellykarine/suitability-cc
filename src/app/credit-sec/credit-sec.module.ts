import { Module } from '@nestjs/common';
import { CreditSecService } from './credit-sec.service';
import { CreditSecControler } from './credit-sec.controller';
import { PrismaService } from 'prisma/prisma.service';
import { CallBackCreditSecService } from './credit-sec-callback.service';

@Module({
  controllers: [CreditSecControler],
  providers: [CreditSecService, CallBackCreditSecService, PrismaService],
})
export class CreditSecModule {}
