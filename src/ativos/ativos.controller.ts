import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AtivosService } from './ativos.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryDto } from './dto/query-ativos.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Ativos')
@ApiBearerAuth('access-token')
@Controller('api/ativos')
export class AtivosController {
  constructor(private readonly ativosService: AtivosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  encontrarTodosAtivos(@Query() params: QueryDto) {
    return this.ativosService.encontrarTodosAtivos(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get('geral')
  geral() {
    return this.ativosService.geral();
  }
}
