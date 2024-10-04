import { Module } from '@nestjs/common';
import { FundosService } from './fundos.service';
import { FundosController } from './fundos.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [FundosController],
  providers: [FundosService, PrismaService],
  exports: [FundosService],
})
export class FundosModule {}
