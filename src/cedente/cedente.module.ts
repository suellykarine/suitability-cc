import { Module } from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CedenteController } from './cedente.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CedenteController],
  providers: [CedenteService, ConfigService],
})
export class CedenteModule {}
