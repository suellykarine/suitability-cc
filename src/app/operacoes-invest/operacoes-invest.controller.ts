import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { OrganizaCarteirasParamsDto } from './dto/organizaCarteiras.dto';
import { OperacoesInvestService } from './operacoes-invest.service';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';

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
  @ApiQuery({
    name: 'identificadorInvestidor',
    required: false,
    example: 1,
    description: 'Identificador do fundo favorecido',
  })
  @Get()
  async buscarTodasOperacoes(
    @Query('identificadorInvestidor') identificadorInvestidor: string,
  ) {
    return this.operacoesInvestService.buscarTodasOperacoes(
      identificadorInvestidor,
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
