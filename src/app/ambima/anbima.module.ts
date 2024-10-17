import { Module } from '@nestjs/common';
import { AnbimaController } from './anbima.controller';
import { AnbimaService } from './anbima.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AnbimaController],
  providers: [AnbimaService, ConfigService],
})
export class AmbimaModule {}
