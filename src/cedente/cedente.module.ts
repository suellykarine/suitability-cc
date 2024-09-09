import { Module } from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CedenteController } from './cedente.controller';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CedenteController],
  providers: [CedenteService, ConfigService],
})
export class CedenteModule {}
