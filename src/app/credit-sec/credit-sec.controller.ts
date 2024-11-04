import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  HttpCode,
} from '@nestjs/common';
import { CriacaoSerieService } from './criacao-de-serie.service';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoCriacaoSerieDto,
} from './dto/body-callback.dto';
import { CriacaoRemessaService } from './criacao-de-remessa.service';

@ApiTags('CREDIT-SEC')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec')
export class CreditSecControler {
  constructor(
    private readonly CriacaoSerieService: CriacaoSerieService,
    private readonly CriacaoRemessaService: CriacaoRemessaService,
  ) {}

  @Post('/solicitar-serie/retorno/criacao-serie')
  callbackCrediSec(@Body() body: BodyRetornoCriacaoSerieDto) {
    return this.CriacaoSerieService.registrarRetornoCreditSec(body);
  }
  @UseGuards(JwtAuthGuardBackoffice)
  @Post('/solicitar-serie/:id_cedente')
  @HttpCode(204)
  solicitarSerie(@Param('id_cedente') id_cedente: string) {
    return this.CriacaoSerieService.solicitarSerie(Number(id_cedente));
  }

  @Post('/solicitar-remessa')
  solicitarRemessa(@Body() body: BodyCriacaoRemessaDto) {
    return this.CriacaoRemessaService.solicitarRemessa(body);
  }
}
