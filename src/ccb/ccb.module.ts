import { Module } from '@nestjs/common';
import { CcbService } from './ccb.service';
import { CcbController } from './ccb.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CcbController],
  providers: [CcbService, ConfigService],
})
export class CcbModule {}
