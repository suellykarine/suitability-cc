import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnbimaService } from './anbima.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Anbima')
@ApiBearerAuth('access-token')
@Controller('api/anbima')
export class AnbimaController {
  constructor(private readonly anbimaService: AnbimaService) {}

  @Get('fundos/:cnpj')
  async obterFundoPorCnpj(@Param('cnpj') cnpj: string) {
    return await this.anbimaService.buscarFundosPorCnpj(cnpj);
  }

  @Get('fundos/detalhe/:codigoAnbima')
  async obterDetalhesFundo(@Param('codigoAnbima') codigoAnbima: string) {
    return await this.anbimaService.buscarDetalhesFundoPorCodigoAnbima(
      codigoAnbima,
    );
  }

  @Get('fundos/serie-historica/:codigoClasse')
  async obterSerieHistorica(@Param('codigoClasse') codigoClasse: string) {
    return await this.anbimaService.buscarSerieHistoricaPorCodigoClasse(
      codigoClasse,
    );
  }
}
