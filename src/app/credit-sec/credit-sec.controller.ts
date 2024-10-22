import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  HttpCode,
} from '@nestjs/common';
import { CreditSecService } from './credit-sec.service';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('SRM-bank')
@ApiBearerAuth('access-token')
@Controller('api/credit-sec/solicitar-serie')
export class CreditSecControler {
  constructor(private readonly CreditSecService: CreditSecService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post(':id_cedente')
  @HttpCode(204)
  solicitarSerie(@Param('id_cedente') id_cedente: string) {
    return this.CreditSecService.solicitarSerie(Number(id_cedente));
  }
}
