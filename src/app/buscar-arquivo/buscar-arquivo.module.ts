import { Module } from '@nestjs/common';
import { BuscarArquivoService } from './buscar-arquivo.service';
import { BuscarArquivoController } from './buscar-arquivo.controller';

@Module({
  controllers: [BuscarArquivoController],
  providers: [BuscarArquivoService],
})
export class BuscarArquivoModule {}
