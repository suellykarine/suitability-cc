import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BodyRetornoCriacaoSerieDto } from './dto/serie-callback.dto';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoRemessaDto,
} from './dto/remessa-callback.dto';
import { CreditSecRemessaService } from './credit-sec-remessa.service';
import { JwtAuthGuardDevelopment } from '../autenticacao/guards/development.guard';
import { SrmWebhooksAuthGuard } from '../autenticacao/guards/srm-webhooks.guard';

@ApiTags('CREDIT-SEC')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec')
export class CreditSecControler {
  constructor(
    private readonly creditSecSerieService: CreditSecSerieService,
    private readonly creditSecRemessaService: CreditSecRemessaService,
  ) {}
  @UseGuards(SrmWebhooksAuthGuard)
  @Post('/serie/emissao/retorno')
  callbackSerieCrediSec(@Body() body: BodyRetornoCriacaoSerieDto) {
    return this.creditSecSerieService.registrarRetornoCreditSec(body);
  }

  @UseGuards(SrmWebhooksAuthGuard)
  @Post('/remessa/emissao/retorno')
  @HttpCode(204)
  callbackRemessaCrediSec(@Body() body: BodyRetornoRemessaDto) {
    return this.creditSecRemessaService.registrarRetornoCreditSec(body);
  }

  @UseGuards(JwtAuthGuardDevelopment)
  @Get('/serie/emissao/verificacao-status-manual')
  verificacaoManualStatusSeries() {
    return this.creditSecSerieService.buscarStatusSolicitacaoSerie();
  }

  @Post('/solicitar-remessa')
  solicitarRemessa(@Body() body: BodyCriacaoRemessaDto) {
    return this.creditSecRemessaService.solicitarRemessa(body);
  }
}
