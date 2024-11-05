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
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DebentureSerieService } from './debentures-serie.service';
import { AtualizarDebentureSerieDto } from './dto/atualizar-debenture-serie.dto';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';
import { DebentureService } from './debentures.service';
import { CriarDebentureDto } from './dto/criar-debenture.dto';
import { JwtAuthGuardPremium } from '../auth/guards/premium-auth.guard';
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
  @Post('serie/:id_debenture/fundo/:id_fundo_investimento')
  async criarNovaSerie(
    @Param('id_debenture') id_debenture: string,
    @Param('id_fundo_investimento') id_fundo_investimento: string,
    @Body() criarDebentureSerieDto: CriarDebentureSerieDto,
  ) {
    return this.debenturesSerieService.criar(
      +id_debenture,
      +id_fundo_investimento,
      criarDebentureSerieDto,
    );
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
  @UseGuards(JwtAuthGuardBackoffice)
  @Delete('serie/:id')
  async deletar(@Param('id') id: string) {
    return this.debenturesSerieService.deletar(+id);
  }
}
