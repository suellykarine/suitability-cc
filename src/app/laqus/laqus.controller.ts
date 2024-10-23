import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { LaqusService } from './laqusService';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Laqus')
@Controller('api/laqus')
export class LaqusController {
  constructor(private readonly laqusService: LaqusService) {}
  @Post('atualizarStatus')
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
