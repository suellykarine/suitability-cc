import { Module } from '@nestjs/common';
import { LaqusController } from './laqus.controller';
import { ConfigService } from '@nestjs/config';
import { LaqusService } from './laqus.service';

@Module({
  controllers: [LaqusController],
  providers: [ConfigService, LaqusService],
  exports: [LaqusService],
})
export class LaqusModule {}
