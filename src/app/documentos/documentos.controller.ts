import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { EnviarDocumentoDto } from './dto/create-documento.dto';
import { AtualizarDocumentoDto } from './dto/update-documento.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../autenticacao/guards/jwt-auth.guard';
import { TipoIdsDocumentos } from 'src/enums/TipoIdsDocumentos';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';

@ApiTags('Documentos')
@ApiBearerAuth('access-token')
@Controller('api/documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  buscarTodosDocumentos() {
    return this.documentosService.buscarTodosDocumentos();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('arquivo'))
  @Post(':id')
  enviarDocumento(
    @Body() enviarDocumentoDto: EnviarDocumentoDto,
    @UploadedFile() arquivo: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.documentosService.enviarDocumento(
      enviarDocumentoDto,
      arquivo,
      +id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async buscarDocumentos(
    @Param('id') id: string,
    @Query('tipoId') tipoId: TipoIdsDocumentos,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.documentosService.buscarDocumentos(
      id,
      tipoId,
      req.user.idUsuario,
    );
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Patch('analisar/:id')
  atualizarDocumento(
    @Param('id') id: string,
    @Body() atualizarDocumentoDto: AtualizarDocumentoDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.documentosService.atualizarDocumento(
      +id,
      atualizarDocumentoDto,
      req.user.idUsuario,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('anexar/:id')
  async anexarDocumento(
    @Param('id') id: string,
    @Body() dadosDocumento: any,
    @Request() req: RequisicaoPersonalizada,
  ) {
    const idFundo = Number(id);

    return this.documentosService.anexarDocumento(
      idFundo,
      dadosDocumento,
      req.user.idUsuario,
    );
  }
}
