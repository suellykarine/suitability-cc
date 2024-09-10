import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { UpdateCedenteDto } from './dto/update-cedente.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CadastroCedenteService } from './cedenteCadastro.service';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';

@Controller('api/cedente')
@ApiBearerAuth('access-token')
@ApiTags('Cedente')
export class CedenteController {
  constructor(
    private readonly cedenteService: CedenteService,
    private readonly cadastroCedenteService: CadastroCedenteService,
  ) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post('cadastro')
  cadastrarCedente(@Body() createCedenteDto: CreateCedenteDto) {
    return this.cadastroCedenteService.cadastrarCedente(createCedenteDto);
  }

  @Get('bancos')
  buscarBancos() {
    return this.cedenteService.buscarBancos();
  }
}
