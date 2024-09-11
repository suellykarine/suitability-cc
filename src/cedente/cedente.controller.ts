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
import { CreateContaCorrenteDto } from './dto/create-conta-corrente.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateProcuradorInvestidorDto } from './dto/create-procurador-investidor.dto';
import { CreateRepresentanteLegalDto } from './dto/create-representante-legal.dto';

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

  @Post('cadastro/:cnpj/contas-corrente')
  cadastrarContaCorrente(
    @Body() createContaCorrenteDto: CreateContaCorrenteDto,
    @Param('cnpj') cnpj: string,
  ) {
    return this.cadastroCedenteService.cadastrarContaCorrente(
      cnpj,
      createContaCorrenteDto,
    );
  }

  @Post('cadastro/:cnpj/contatos')
  cadastrarContato(
    @Body() createContato: CreateContatoDto,
    @Param('cnpj') cnpj: string,
  ) {
    return this.cadastroCedenteService.cadastrarContato(cnpj, createContato);
  }

  @Post('cadastro/:cnpj/procuradores-investidores')
  cadastrarProcuradorInvestidor(
    @Body() createProcuradorInvestidor: CreateProcuradorInvestidorDto,
    @Param('cnpj') cnpj: string,
  ) {
    return this.cadastroCedenteService.cadastrarProcuradorInvestidor(
      cnpj,
      createProcuradorInvestidor,
    );
  }

  @Post('cadastro/:cnpj/representantes-legais-investidores')
  cadastraReprepresentantesLegaisInvestidores(
    @Body() createRepresentanteLegalDto: CreateRepresentanteLegalDto,
    @Param('cnpj') cnpj: string,
  ) {
    return this.cadastroCedenteService.cadastrarRepresentantesLegaisInvestidores(
      cnpj,
      createRepresentanteLegalDto,
    );
  }
}
