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

@UseGuards(JwtAuthGuardBackoffice)
@ApiTags('Debentures')
@ApiBearerAuth('access-token')
@Controller('api/debentures')
export class DebenturesController {
  constructor(
    private readonly debenturesSerieService: DebentureSerieService,
    private readonly debentureService: DebentureService,
  ) {}

  @Get()
  async listarDebentures() {
    return this.debentureService.listarDebentures();
  }

  @Post()
  async criarDebenture(@Body() criarDebentureDto: CriarDebentureDto) {
    return this.debentureService.criarDebenture(criarDebentureDto);
  }

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

  @Get('serie/:id')
  async encontrarPorId(@Param('id') id: string) {
    return this.debenturesSerieService.encontrarPorId(+id);
  }

  @Post('serie/:id_debenture/fundo/:id_fundo_investimento')
  async createNextSeries(
    @Param('id_debenture') id_debenture: string,
    @Param('id_fundo_investimento') id_fundo_investimento: string,
  ) {
    return this.debenturesSerieService.criar(
      +id_debenture,
      +id_fundo_investimento,
    );
  }

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

  @Delete('serie/:id')
  async deletar(@Param('id') id: string) {
    return this.debenturesSerieService.deletar(+id);
  }
}
