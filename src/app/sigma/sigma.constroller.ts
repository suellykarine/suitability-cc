import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CodigoOperacaoDto } from '../debentures/dto/codigo-operacao.dto';
import { PagamentoOperacaoService } from './sigma.pagamentoOperacao.service';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';

@UseGuards(JwtAuthGuardBackoffice)
@ApiTags('Sigma')
@ApiBearerAuth('access-token')
@Controller('api/sigma')
export class SigmaController {
  constructor(
    private readonly pagamentoOperacaoService: PagamentoOperacaoService,
  ) {}
  @Post('pagamento/:id_conta_investidor')
  incluirPagamentoPix(
    @Body() codigoOperacaoDto: CodigoOperacaoDto,
    @Param('id_conta_investidor') idContaInvestidor: string,
  ) {
    return this.pagamentoOperacaoService.incluirPagamento(
      codigoOperacaoDto.codigoOperacao,
      +idContaInvestidor,
    );
  }
}
