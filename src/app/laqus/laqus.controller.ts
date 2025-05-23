import { Body, Post, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LaqusService } from './laqus.service';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';

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
