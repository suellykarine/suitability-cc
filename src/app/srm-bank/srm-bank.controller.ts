import { Controller, Post, Body, UseGuards, Param, Get } from '@nestjs/common';
import { JwtAuthGuardBackoffice } from 'src/app/autenticacao/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CriarContaSrmBankDto } from './dto/criar-conta-srm-bank.dto';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { SrmBankService } from './srm-bank.service';

@ApiTags('SRM-bank')
@ApiBearerAuth('access-token')
@Controller('api/srm-bank')
export class SrmBankController {
  constructor(private readonly srmBankService: SrmBankService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post(':id_cedente')
  criarContaSrmBank(
    @Body() criarConta: CriarContaSrmBankDto,
    @Param('id_cedente') id_cedente: string,
  ) {
    return this.srmBankService.criarContaInvestidor({
      identificador: criarConta.identificador,
      id_cedente,
    });
  }
  @UseGuards(JwtAuthGuardPremium)
  @Get('conta/:id_fundo_investidor')
  buscarContaInvestidor(
    @Param('id_fundo_investidor') id_fundo_investidor: string,
  ) {
    return this.srmBankService.buscarContaInvestidor(
      Number(id_fundo_investidor),
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Get('saldo/:numeroConta')
  async buscarSaldoContaInvestidor(@Param('numeroConta') numeroConta: string) {
    return this.SrmBankService.buscarSaldoContaInvestidor(Number(numeroConta));
  }
}
