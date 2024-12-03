import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BodyRetornoCriacaoSerieDto } from './dto/serie-callback.dto';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoRemessaDto,
} from './dto/remessa-callback.dto';
import { CreditSecRemessaService } from './credit-sec-remessa.service';

@ApiTags('CREDIT-SEC')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec')
export class CreditSecControler {
  constructor(
    private readonly creditSecSerieService: CreditSecSerieService,
    private readonly creditSecRemessaService: CreditSecRemessaService,
  ) {}

  @Post('/solicitar-serie/retorno/criacao-serie')
  callbackSerieCrediSec(@Body() body: BodyRetornoCriacaoSerieDto) {
    return this.creditSecSerieService.registrarRetornoCreditSec(body);
  }

  @Post('/solicitar-remessa/retorno/criacao-remessa')
  @HttpCode(204)
  callbackRemessaCrediSec(@Body() body: BodyRetornoRemessaDto) {
    return this.creditSecRemessaService.registrarRetornoCreditSec(body);
  }
  @Post('/solicitar-remessa')
  solicitarRemessa(@Body() body: BodyCriacaoRemessaDto) {
    return this.creditSecRemessaService.solicitarRemessa(body);
  }
}
