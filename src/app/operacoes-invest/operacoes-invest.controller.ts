import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { OperacoesInvestService } from './operacoes-invest.service';

@ApiTags('operacao-invest')
@ApiBearerAuth('access-token')
@Controller('api/operacoes-invest')
export class OperacoesInvestController {
  constructor(
    private readonly operacoesInvestService: OperacoesInvestService,
  ) {}

  @UseGuards(JwtAuthGuardPremium)
  @Get(':codigoOperacao')
  async buscarTransacaoPorCodigoOperacao(
    @Param('codigoOperacao') codigoOperacao: string,
  ) {
    return this.operacoesInvestService.buscarTransacaoPorCodigoOperacao(
      Number(codigoOperacao),
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Get()
  async buscarTodasOperacoes() {
    return this.operacoesInvestService.buscarTodasOperacoes();
  }
}
