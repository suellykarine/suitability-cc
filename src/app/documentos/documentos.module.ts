import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { FundosModule } from '../fundos/fundos.module';
import { PrismaService } from 'prisma/prisma.service';
import { DocumentoRepositorio } from 'src/repositorios/contratos/documentoRepositorio';
import { PrismaDocumentoRepositorio } from 'src/repositorios/prisma/prismaDocumentoRepositorio';
import { FundosService } from '../fundos/fundos.service';

@Module({
  imports: [FundosModule],
  controllers: [DocumentosController],
  providers: [
    DocumentosService,
    PrismaService,
    FundosService,
    {
      provide: DocumentoRepositorio,
      useClass: PrismaDocumentoRepositorio,
    },
  ],
})
export class DocumentosModule {}
