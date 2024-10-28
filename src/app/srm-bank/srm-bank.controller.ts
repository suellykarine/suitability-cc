import { Controller, Post, Body, UseGuards, Param, Get } from '@nestjs/common';
import { SrmBankService } from './srm-bank.service';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CriarContaSrmBankDto } from './dto/criar-conta-srm-bank.dto';
import { JwtAuthGuardPremium } from '../auth/guards/premium-auth.guard';

@ApiTags('SRM-bank')
@ApiBearerAuth('access-token')
@Controller('api/srm-bank')
export class SrmBankController {
  constructor(private readonly SrmBankService: SrmBankService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post(':id_cedente')
  criarContaSrmBank(
    @Body() criarConta: CriarContaSrmBankDto,
    @Param('id_cedente') id_cedente: string,
  ) {
    return this.SrmBankService.criarContaInvestidor({
      identificador: criarConta.identificador,
      id_cedente,
    });
  }
  @UseGuards(JwtAuthGuardBackoffice, JwtAuthGuardPremium)
  @Get('conta/:id_fundo_investidor')
  buscarContaInvestidor(
    @Param('id_fundo_investidor') id_fundo_investidor: string,
  ) {
    return this.SrmBankService.buscarContaInvestidor(
      Number(id_fundo_investidor),
    );
  }
}
