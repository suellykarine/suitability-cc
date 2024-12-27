import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DebentureSerieService } from './debentures-serie.service';
import { AtualizarValorDaSerieDto } from './dto/atualizar-debenture-serie.dto';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';
import { DebentureService } from './debentures.service';
import { CriarDebentureDto } from './dto/criar-debenture.dto';
import { JwtAuthGuardPremium } from '../autenticacao/guards/premium-auth.guard';
import { CriarDebentureSerieDto } from './dto/criar-debenure-serie.dto';

@ApiTags('Debentures')
@ApiBearerAuth('access-token')
@Controller('api/debentures')
export class DebenturesController {
  constructor(
    private readonly debenturesSerieService: DebentureSerieService,
    private readonly debentureService: DebentureService,
  ) {}

  @UseGuards(JwtAuthGuardPremium)
  @Get()
  async listarDebentures() {
    return this.debentureService.listarDebentures();
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Post()
  async criarDebenture(@Body() criarDebentureDto: CriarDebentureDto) {
    return this.debentureService.criarDebenture(criarDebentureDto);
  }
  @UseGuards(JwtAuthGuardPremium)
  @Get('/serie')
  @ApiQuery({
    name: 'pagina',
    required: false,
    example: 1,
    description: 'Página a ser retornada',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    example: 10,
    description: 'Número de registros por página',
  })
  async encontrarTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 10,
  ) {
    return this.debenturesSerieService.encontrarTodos(
      Number(pagina),
      Number(limite),
    );
  }

  @UseGuards(JwtAuthGuardPremium)
  @Get('serie/:id')
  async encontrarPorId(@Param('id') id: string) {
    return this.debenturesSerieService.encontrarPorId(+id);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Post('serie/backoffice')
  async solicitarSerie(@Body() payload: CriarDebentureSerieDto) {
    return this.debenturesSerieService.solicitarSerieBackOffice(payload);
  }

  @UseGuards(JwtAuthGuardPremium)
  @Patch('serie/valor/:id')
  async atualizarValorDaSerie(
    @Param('id') id: string,
    @Body() atualizarValorDaSerieDto: AtualizarValorDaSerieDto,
  ) {
    const { valorSerie } = atualizarValorDaSerieDto;
    const idDebentureSerie = Number(id);
    const data = {
      idDebentureSerie,
      valorSerie,
    };
    return this.debenturesSerieService.atualizarValorDaSerie(data);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Delete('serie/:id')
  async deletar(@Param('id') id: string) {
    return this.debenturesSerieService.deletar(+id);
  }
  @UseGuards(JwtAuthGuardPremium)
  @ApiQuery({
    required: false,
    name: 'idGestorFundo',
    example: '12345',
  })
  @Get('operacao-debenture')
  async listarOperacoesPorGestorFundo(
    @Query('idGestorFundo') idGestorFundo: string,
  ) {
    if (idGestorFundo)
      return await this.debenturesSerieService.listarOperacoesPorGestorFundo(
        Number(idGestorFundo),
      );
    return await this.debenturesSerieService.listarTodasOperacoes();
  }

  @ApiQuery({
    name: 'valor',
    type: String,
    required: true,
    description: 'Valor do investimento',
  })
  @Get('serie-investidor/:id')
  async temDebentureSerieComSaldo(
    @Param('id') id: string,
    @Query('valor') valor: string,
  ) {
    const valorEntrada = Number(valor);
    const idInvestidor = Number(id);

    if (!valorEntrada)
      throw new BadRequestException({
        acao: 'debenture.controller.serie-investidor/:id',
        mensagem: 'valor inválido',
      });
    if (!idInvestidor)
      throw new BadRequestException({
        acao: 'debenture.controller.serie-investidor/:id',
        mensagem: 'id inválido',
      });

    const service = await this.debenturesSerieService.estaAptoAEstruturar(
      idInvestidor,
      valorEntrada,
    );
    return service;
  }
}
