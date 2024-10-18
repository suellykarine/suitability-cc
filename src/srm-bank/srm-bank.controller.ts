import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { SrmBankService } from './srm-bank.service';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CriarContaSrmBankDto } from './dto/criar-conta-srm-bank.dto';

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
}
