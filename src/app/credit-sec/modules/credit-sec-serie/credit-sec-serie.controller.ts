import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmissaoSerieRetornoDto } from './dto/serie-callback.dto';
import { SrmWebhooksAuthGuard } from 'src/app/autenticacao/guards/srm-webhooks.guard';
import { JwtAuthGuardDevelopment } from 'src/app/autenticacao/guards/development.guard';

@ApiTags('CREDIT-SEC-SERIE')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec/serie')
export class CreditSecSerieController {
  constructor(private readonly creditSecSerieService: CreditSecSerieService) {}
  @UseGuards(SrmWebhooksAuthGuard)
  @Post('/emissao/retorno')
  callbackSerieCrediSec(@Body() body: EmissaoSerieRetornoDto) {
    return this.creditSecSerieService.registrarRetornoCreditSec(body);
  }

  @UseGuards(JwtAuthGuardDevelopment)
  @Get('/emissao/verificacao-status-manual')
  verificacaoManualStatusSeries() {
    return this.creditSecSerieService.buscarStatusSolicitacaoSerie();
  }
}
