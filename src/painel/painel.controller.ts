import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { PainelService } from './painel.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Painel')
@ApiBearerAuth('access-token')
@Controller('api/painel')
export class PainelController {
  constructor(private readonly painelService: PainelService) {}

  @UseGuards(JwtAuthGuard)
  @Get('geral/:cnpj')
  geral(@Param('cnpj') cnpj: string, @Request() req: RequisicaoPersonalizada) {
    return this.painelService.obterRentabilidadeGeral(cnpj, req.user.idUsuario);
  }

  @UseGuards(JwtAuthGuard)
  @Get('portfolio/:cnpj')
  portfolio(@Param('cnpj') cnpj: string) {
    return this.painelService.obterPortfolio(cnpj);
  }
}
