import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CcbService } from './ccb.service';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuardPremium)
@ApiBearerAuth('access-token')
@ApiTags('CCB')
@Controller('api/ccb')
export class CcbController {
  constructor(private readonly ccbService: CcbService) {}

  @Get(':codigoOperacao/')
  async obterCCBAssinada(@Param('codigoOperacao') codigoOperacao: number) {
    return await this.ccbService.buscarCCCBAssinada(codigoOperacao);
  }
}
