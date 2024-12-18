import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { OrganizaCarteirasParamsDto } from './dto/organizaCarteiras.dto';
import { OperacoesInvestService } from './operacoes-invest.service';

@ApiTags('operacao-invest')
@ApiBearerAuth('access-token')
@Controller('api/operacoes-invest')
export class OperacoesInvestController {
  constructor(
    private readonly operacoesInvestService: OperacoesInvestService,
  ) {}

  @UseGuards(JwtAuthGuardPremium)
  @ApiParam({
    name: 'codigoOperacao',
    description: 'codigo de operação para busca',
  })
  @Get(':codigoOperacao')
  async buscarTransacaoPorCodigoOperacao(
    @Param('codigoOperacao') codigoOperacao: string,
  ) {
    return this.operacoesInvestService.buscarTransacaoPorCodigoOperacao(
      Number(codigoOperacao),
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @ApiParam({
    name: 'codigoOperacao',
    description: 'codigo de operação para busca',
  })
  @Get('/calculos/:codigoOperacao')
  async buscarOperacaoPorCodigoOperacaoComCalculos(
    @Param('codigoOperacao') codigoOperacao: string,
  ) {
    return this.operacoesInvestService.buscarOperacaoPorCodigoOperacaoComCalculos(
      Number(codigoOperacao),
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @ApiQuery({
    name: 'identificadorCedente',
    required: true,
    example: '1234',
    description: 'Identificador do cedente',
  })
  @Get()
  async buscarTodasOperacoes(
    @Query('identificadorCedente') identificadorCedente: string,
  ) {
    return this.operacoesInvestService.buscarTodasOperacoes(
      identificadorCedente,
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Get('/organizarCarteiras/:identificadorInvestidor')
  async organizaCarteiras(
    @Param('identificadorInvestidor') identificadorInvestidor: string,
    @Query() queries: OrganizaCarteirasParamsDto,
  ) {
    return this.operacoesInvestService.organizarCarteiras({
      ...queries,
      identificadorInvestidor,
    });
  }
}
