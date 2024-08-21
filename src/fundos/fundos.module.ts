import { Module } from '@nestjs/common';
import { FundosService } from './fundos.service';
import { FundosController } from './fundos.controller';

@Module({
  controllers: [FundosController],
  providers: [FundosService],
  exports: [FundosService],
})
export class FundosModule {}
