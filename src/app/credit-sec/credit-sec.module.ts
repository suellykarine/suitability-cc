import { Module } from '@nestjs/common';
import { CreditSecService } from './credit-sec.service';
import { CreditSecControler } from './credit-sec.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [CreditSecControler],
  providers: [CreditSecService, PrismaService],
})
export class CreditSecModule {}
