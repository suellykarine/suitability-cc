import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreditSecRemessaService } from './credit-sec-remessa.service';

import {
  EmissaoRemessaDto,
  EmissaoRemessaRetornoDto,
} from './dto/remessa-callback.dto';
import { SrmWebhooksAuthGuard } from 'src/app/autenticacao/guards/srm-webhooks.guard';
import { JwtAuthGuardDevelopment } from 'src/app/autenticacao/guards/development.guard';

@ApiTags('CREDIT-SEC-REMESSA')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec/remessa')
export class CreditSecRemessaController {
  constructor(
    private readonly creditSecRemessaService: CreditSecRemessaService,
  ) {}

  @UseGuards(SrmWebhooksAuthGuard)
  @Post('/emissao/retorno')
  @HttpCode(204)
  callbackRemessaCrediSec(@Body() body: EmissaoRemessaRetornoDto) {
    return this.creditSecRemessaService.registrarRetornoCreditSec(body);
  }

  @UseGuards(JwtAuthGuardDevelopment)
  @Get('/emissao/solicitar-com-erros')
  solicitarRemessaComErros() {
    return this.creditSecRemessaService.repetirSolicitacaoRemessaComErro();
  }

  @Post('/emissao')
  solicitarRemessa(@Body() body: EmissaoRemessaDto) {
    return this.creditSecRemessaService.solicitarRemessa(body);
  }
}
