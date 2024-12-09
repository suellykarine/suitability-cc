import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OperacoesInvestService } from './operacoes-invest.service';
import { OperacoesInvestController } from './operacoes-invest.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [OperacoesInvestController],
  providers: [OperacoesInvestService],
  exports: [OperacoesInvestService],
})
export class OperacaoInvestModule {}
