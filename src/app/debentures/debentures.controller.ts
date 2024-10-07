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
import { AtualizarDebentureSerieDto } from './dto/atualizar-debenture.dto';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';

@UseGuards(JwtAuthGuardBackoffice)
@ApiTags('Debentures')
@ApiBearerAuth('access-token')
@Controller('api/debentures')
export class DebenturesController {
  constructor(private readonly debenturesSerieService: DebentureSerieService) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Página a ser retornada',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Número de registros por página',
  })
  async findAll(@Query('pagina') pagina = 1, @Query('limite') limite = 10) {
    return this.debenturesSerieService.encontrarTodos(
      Number(pagina),
      Number(limite),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.debenturesSerieService.encontrarPorId(+id);
  }

  @Post(':id_debenture/fundo/:id_fundo_investimento')
  async createNextSeries(
    @Param('id_debenture') id_debenture: string,
    @Param('id_fundo_investimento') id_fundo_investimento: string,
  ) {
    return this.debenturesSerieService.criar(
      +id_debenture,
      +id_fundo_investimento,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() atualizarDebentureSerieDto: AtualizarDebentureSerieDto,
  ) {
    return this.debenturesSerieService.atualizar(
      +id,
      atualizarDebentureSerieDto,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.debenturesSerieService.deletar(+id);
  }
}
