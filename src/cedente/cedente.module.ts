import { Module } from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CedenteController } from './cedente.controller';
import { ConfigService } from '@nestjs/config';
import { CadastroCedenteService } from './cedenteCadastro.service';

@Module({
  controllers: [CedenteController],
  providers: [CedenteService, ConfigService, CadastroCedenteService],
})
export class CedenteModule {}
