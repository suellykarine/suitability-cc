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
import {
  AtualizarDebentureSerieDto,
  AtualizarValorDaSerieDto,
} from './dto/atualizar-debenture-serie.dto';
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

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  async listarDebentures() {
    return this.debentureService.listarDebentures();
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Post()
  async criarDebenture(@Body() criarDebentureDto: CriarDebentureDto) {
    return this.debentureService.criarDebenture(criarDebentureDto);
  }

  @UseGuards(JwtAuthGuardBackoffice)
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
  @Post('serie')
  async solicitarSerie(@Body() payload: CriarDebentureSerieDto) {
    return this.debenturesSerieService.solicitarSerie(payload);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Patch('serie/:id')
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarDebentureSerieDto: AtualizarDebentureSerieDto,
  ) {
    return this.debenturesSerieService.atualizar(
      +id,
      atualizarDebentureSerieDto,
    );
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
  @Get('serie-investidor/:id/:valor')
  async temDebentureSerieComSaldo(
    @Param('id') id: string,
    @Param('valor') valor: string,
  ) {
    const valorEntrada = Number(valor);
    const idInvestidor = Number(id);
    if (!valorEntrada) throw new BadRequestException('valor inválido');
    if (!idInvestidor) throw new BadRequestException('id inválido');

    const service = await this.debenturesSerieService.estaAptoAEstruturar(
      idInvestidor,
      valorEntrada,
    );
    return service;
  }
}
