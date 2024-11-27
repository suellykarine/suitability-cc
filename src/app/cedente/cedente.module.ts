import { Module } from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CedenteController } from './cedente.controller';
import { ConfigService } from '@nestjs/config';
import { CadastroCedenteService } from './cedenteCadastro.service';
import { DocumentoCedenteService } from './cedenteDocumentos.service';

@Module({
  controllers: [CedenteController],
  providers: [
    CedenteService,
    ConfigService,
    CadastroCedenteService,
    DocumentoCedenteService,
  ],
  exports: [CedenteService, CadastroCedenteService],
})
export class CedenteModule {}
