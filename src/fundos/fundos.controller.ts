import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FundosService } from './fundos.service';
import { CreateFundosDto } from './dto/create-fundo.dto';
import { UpdateFundoDto } from './dto/update-fundo.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';
import { JwtAuthGuardPremium } from 'src/auth/guards/premium-auth.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';

@ApiTags('fundos')
@ApiBearerAuth('access-token')
@Controller('api/fundos')
export class FundosController {
  constructor(private readonly fundosService: FundosService) {}

  @UseGuards(JwtAuthGuardPremium)
  @Post()
  criarFundo(
    @Body() createFundosDto: CreateFundosDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.fundosService.criarFundo(
      req.user.idUsuario,
      createFundosDto.fundos,
    );
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  buscarFundos() {
    return this.fundosService.buscarFundos();
  }

  @Get(':id')
  buscarUmFundo(@Param('id') id: string) {
    return this.fundosService.findOne(+id);
  }

  @Patch(':id')
  atualizarFundo(
    @Param('id') id: string,
    @Body() updateFundoDto: UpdateFundoDto,
  ) {
    return this.fundosService.update(+id, updateFundoDto);
  }

  @Delete(':id')
  removerFundo(@Param('id') id: string) {
    return this.fundosService.remove(+id);
  }
}
