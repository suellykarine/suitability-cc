import { Controller, Post, UseGuards, Param, Get } from '@nestjs/common';
import { JwtAuthGuardBackoffice } from 'src/app/autenticacao/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { SrmBankService } from './srm-bank.service';

@ApiTags('SRM-bank')
@ApiBearerAuth('access-token')
@Controller('api/srm-bank')
export class SrmBankController {
  constructor(private readonly srmBankService: SrmBankService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post(':id_cedente')
  criarContaSrmBank(@Param('id_cedente') id_cedente: string) {
    return this.srmBankService.criarContaInvestidor(Number(id_cedente));
  }

  @UseGuards(JwtAuthGuardPremium)
  @ApiParam({
    name: 'idContaInvestidor',
    example: '123456',
    required: true,
  })
  @Get('saldo/:idContaInvestidor')
  async buscarSaldoContaInvestidor(
    @Param('idContaInvestidor') idContaInvestidor: string,
  ) {
    return this.srmBankService.buscarSaldoContaInvestidor(idContaInvestidor);
  }
}
