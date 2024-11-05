import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CcbService } from './ccb.service';
import { Response } from 'express';
import { JwtAuthGuardPremium } from '../auth/guards/premium-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuardPremium)
@ApiBearerAuth('access-token')
@ApiTags('CCB')
@Controller('api/ccb')
export class CcbController {
  constructor(private readonly ccbService: CcbService) {}

  @Get(':codigoOperacao/assinatura-digital')
  async obterAssinaturaDigital(
    @Param('codigoOperacao') codigoOperacao: string,
    @Res() resposta: Response,
  ) {
    try {
      const { buffer, contentType, contentDisposition } =
        await this.ccbService.obterAssinaturaDigital(codigoOperacao);

      resposta.setHeader('Content-Type', contentType);
      resposta.setHeader('Content-Disposition', contentDisposition);
      resposta.status(HttpStatus.OK).send(Buffer.from(buffer));
    } catch (erro) {
      throw new HttpException(erro.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
