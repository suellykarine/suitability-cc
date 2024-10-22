import { Body, Post, Param, Get, Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { JwtAuthGuardBackoffice } from 'src/app/auth/guards/backoffice-auth.guard';
import { LaqusService } from './laqus.service';

@ApiTags('Laqus')
@Controller('api/laqus')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuardBackoffice)
export class LaqusController {
  constructor(private readonly laqusService: LaqusService) {}

  @Post('cadastrar')
  async cadastrar(@Body() criarInvestidorLaqusDto: CriarInvestidorLaqusDto) {
    return this.laqusService.cadastrarInvestidor(criarInvestidorLaqusDto);
  }

  @Get('buscar-status-investidor/:id')
  async buscarStatus(@Param('id') id: string) {
    return this.laqusService.buscarStatusInvestidor(id);
  }
}
