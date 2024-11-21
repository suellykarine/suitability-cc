import { Controller, Post, Body } from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoCriacaoSerieDto,
} from './dto/body-callback.dto';
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
  callbackCrediSec(@Body() body: BodyRetornoCriacaoSerieDto) {
    return this.creditSecSerieService.registrarRetornoCreditSec(body);
  }
  @Post('/solicitar-remessa')
  solicitarRemessa(@Body() body: BodyCriacaoRemessaDto) {
    return this.creditSecRemessaService.solicitarRemessa(body);
  }
}
