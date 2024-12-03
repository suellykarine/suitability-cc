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
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { EnviarDocumentoDto } from './dto/criar-documento.dto';
import { AtualizarDocumentoStatusDto } from './dto/atualizar-documento.dto';
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf',
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    arquivo: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.documentosService.enviarDocumento(
      enviarDocumentoDto,
      arquivo,
      +id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('arquivo'))
  @Patch(':id')
  atualizarDocumento(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf',
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    arquivo: Express.Multer.File,
    @Param('id') id: string,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.documentosService.atualizarDocumento(
      +id,
      arquivo,
      req.user.idUsuario,
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
  atualizarStatusDocumento(
    @Param('id') id: string,
    @Body() atualizarDocumentoStatusDto: AtualizarDocumentoStatusDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.documentosService.atualizarStatusDocumento(
      +id,
      atualizarDocumentoStatusDto,
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
