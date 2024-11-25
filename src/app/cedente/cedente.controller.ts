import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Request,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CadastroCedenteService } from './cedenteCadastro.service';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';
import { CreateContaCorrenteDto } from './dto/create-conta-corrente.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateProcuradorInvestidorDto } from './dto/create-procurador-investidor.dto';
import { CreateRepresentanteLegalDto } from './dto/create-representante-legal.dto';
import { AprovarDocumentoDto } from './dto/aprovar-documento.dto';
import { DocumentoCedenteService } from './cedenteDocumentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/cedente')
@ApiBearerAuth('access-token')
@ApiTags('Cedente')
@UseGuards(JwtAuthGuardBackoffice)
export class CedenteController {
  constructor(
    private readonly cedenteService: CedenteService,
    private readonly cadastroCedenteService: CadastroCedenteService,
    private readonly documentoCedenteService: DocumentoCedenteService,
  ) {}

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

  @Post('documentos/registrar')
  @UseInterceptors(FileInterceptor('arquivo'))
  registrarDocumento(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    arquivo: any,
    @Body() createDocumentoDto: CreateDocumentoDto,
  ) {
    return this.documentoCedenteService.registrarDocumento(
      arquivo,
      createDocumentoDto,
    );
  }

  @Put('documentos/:id/aprovar')
  aprovarDocumento(
    @Param('id') id: string,
    @Body() aprovarDocumentoDto: AprovarDocumentoDto,
  ) {
    return this.documentoCedenteService.aprovarDocumento(
      id,
      aprovarDocumentoDto,
    );
  }

  @Get('documentos/:cnpj')
  buscarDocumentosPorCnpj(@Param('cnpj') cnpj: string) {
    return this.documentoCedenteService.buscarDocumentosPorCnpj(cnpj);
  }
}
