import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  HttpCode,
} from '@nestjs/common';
import { CreditSecSerieService } from './credit-sec-serie.service';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
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
    private readonly CreditSecSerieService: CreditSecSerieService,
    private readonly CreditSecRemessaService: CreditSecRemessaService,
  ) {}

  @Post('/solicitar-serie/retorno/criacao-serie')
  callbackCrediSec(@Body() body: BodyRetornoCriacaoSerieDto) {
    return this.CreditSecSerieService.registrarRetornoCreditSec(body);
  }
  @Post('/solicitar-remessa')
  solicitarRemessa(@Body() body: BodyCriacaoRemessaDto) {
    return this.CreditSecRemessaService.solicitarRemessa(body);
  }
}
