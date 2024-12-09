import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { OperacoesInvestService } from './operacoes-invest.service';
import { OperacoesInvestController } from './operacoes-invest.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [OperacoesInvestController],
  providers: [ConfigService, OperacoesInvestService],
  exports: [OperacoesInvestService],
})
export class OperacaoInvestModule {}
