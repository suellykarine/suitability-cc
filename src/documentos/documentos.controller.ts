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
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TipoIdsDocumentos } from 'src/enums/TipoIdsDocumentos';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';

@ApiTags('Documentos')
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.update(+id, updateDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(+id);
  }
}
