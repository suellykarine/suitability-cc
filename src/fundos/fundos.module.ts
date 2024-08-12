import { Module } from '@nestjs/common';
import { FundosService } from './fundos.service';
import { FundosController } from './fundos.controller';

@Module({
  controllers: [FundosController],
  providers: [FundosService],
})
export class FundosModule {}
