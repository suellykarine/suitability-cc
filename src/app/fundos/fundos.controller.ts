import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FundosService } from './fundos.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';
import { JwtAuthGuardPremium } from '../auth/guards/premium-auth.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { CriarFundosDto } from './dto/criar-fundo.dto';
import { CriarFactoringsDto } from './dto/criar-factoring.dto';
import { CriarSecuritizadorasDto } from './dto/criar-securitizaroda.dto copy';
import { PerfisInvestimento } from 'src/enums/PerfisInvestimento';
import { AtualizarFundoDto } from './dto/atualizar-fundo.dto';

@ApiTags('Fundos')
@ApiBearerAuth('access-token')
@Controller('api/fundos')
export class FundosController {
  constructor(private readonly fundosService: FundosService) {}

  @UseGuards(JwtAuthGuardPremium)
  @Post()
  criarFundo(
    @Body() criarFundosDto: CriarFundosDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.criarFundo(
      req.user.idUsuario,
      criarFundosDto.fundos,
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Post('factoring')
  criarFactoring(
    @Body() criarFactoringsDto: CriarFactoringsDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.criarFactoring(
      req.user.idUsuario,
      criarFactoringsDto.fundos,
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Post('securitizadora')
  criarSecuritizadora(
    @Body() criarSecuritizadorasDto: CriarSecuritizadorasDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.criarSecuritizadora(
      req.user.idUsuario,
      criarSecuritizadorasDto.fundos,
    );
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  buscarFundos() {
    return this.fundosService.buscarFundos();
  }

  @UseGuards(JwtAuthGuardPremium)
  @Get('usuario')
  buscarFundosDoUsuario(@Request() req: RequisicaoPersonalizada) {
    return this.fundosService.buscarFundosDoUsuario(req.user.idUsuario);
  }

  @UseGuards(JwtAuthGuardPremium)
  @Patch(':id')
  atualizarFundo(
    @Param('id') id: string,
    @Body() atualizarFundoDto: AtualizarFundoDto,
    @Query('PERFIL_INVESTIMENTO') tipoEstrutura: PerfisInvestimento,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.patchFundo(
      +id,
      atualizarFundoDto,
      tipoEstrutura,
      req.user.idUsuario,
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Delete(':id')
  deletarFundo(
    @Param('id') id: string,
    @Query('ID_GESTOR_FUNDO') assetId: string,
    @Query('PERFIL_INVESTIMENTO') tipoEstrutura: PerfisInvestimento,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.deleteFundo(
      +id,
      +assetId,
      tipoEstrutura,
      req.user.idUsuario,
    );
  }
}
