import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { PainelService } from './painel.service';
import { JwtAuthGuard } from '../autenticacao/guards/jwt-auth.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { decodificarToken } from '../../utils/extrairId';

@ApiTags('Painel')
@ApiBearerAuth('access-token')
@Controller('api/painel')
export class PainelController {
  constructor(private readonly painelService: PainelService) {}

  //@UseGuards(JwtAuthGuard)
  @Get('geral/:cnpj')
  geral(@Param('cnpj') cnpj: string, @Request() req: RequisicaoPersonalizada) {
    const tokenDecodificado = decodificarToken(
      req.headers.authorization.replace(/^Bearer\s/, ''),
    );
    return this.painelService.obterRentabilidadeGeral(
      cnpj,
      tokenDecodificado.idUsuario,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('portfolio/:cnpj')
  portfolio(@Param('cnpj') cnpj: string) {
    return this.painelService.obterPortfolio(cnpj);
  }
}
