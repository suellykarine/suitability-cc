import { Controller, UseGuards, Param, Get } from '@nestjs/common';
import { JwtAuthGuardBackoffice } from 'src/app/autenticacao/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { SrmBankService } from './srm-bank.service';

@ApiTags('SRM-bank')
@ApiBearerAuth('access-token')
@Controller('api/srm-bank')
export class SrmBankController {
  constructor(private readonly srmBankService: SrmBankService) {}
  @UseGuards(JwtAuthGuardBackoffice, JwtAuthGuardPremium)
  @Get('conta/:id_fundo_investidor')
  buscarContaInvestidor(
    @Param('id_fundo_investidor') id_fundo_investidor: string,
  ) {
    return this.srmBankService.buscarContaInvestidor(
      Number(id_fundo_investidor),
    );
  }
}
