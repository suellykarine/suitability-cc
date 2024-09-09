import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { FundosModule } from 'src/fundos/fundos.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [FundosModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, PrismaService],
})
export class DocumentosModule {}
