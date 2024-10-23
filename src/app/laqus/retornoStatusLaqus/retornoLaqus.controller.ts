import { StatusRetornoLaqusDto } from '../dto/statusRetornoLaqus.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { RetornoLaqusService } from './retornoStatusLaqus.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Laqus')
@Controller('/api/laqus/atualizarStatus')
export class LaqusController {
  constructor(private readonly laqusService: RetornoLaqusService) {}
  @Post('')
  async atualizarStatusLaqus(
    @Body() statusRetornoLaqusDto: StatusRetornoLaqusDto,
  ) {
    const { identificadorInvestidor, status, justificativa } =
      statusRetornoLaqusDto;
    return this.laqusService.AtualizarInvestidorDebenture({
      identificadorInvestidor,
      status,
      justificativa,
    });
  }
}
