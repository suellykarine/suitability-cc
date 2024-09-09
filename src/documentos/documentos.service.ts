import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AnexarDocumentoDto,
  EnviarDocumentoDto,
} from './dto/create-documento.dto';
import { AtualizarDocumentoDto } from './dto/update-documento.dto';
import { StatusDocumento } from 'src/enums/StatusDocumento';
import { TipoIdsDocumentos } from 'src/enums/TipoIdsDocumentos';
import { FundosService } from 'src/fundos/fundos.service';
import { Documento } from './entities/documento.entity';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly fundosService: FundosService,
    private prisma: PrismaService,
  ) {}
  async enviarDocumento(
    enviarDocumentoDto: EnviarDocumentoDto,
    arquivo: Express.Multer.File,
    id: number,
  ) {
    if (arquivo.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Tipo de arquivo inválido. Apenas arquivos PDF são permitidos.',
      );
    }

    const entidade = await this.obterEntidadePorIdETipo(
      id,
      enviarDocumentoDto.tipo_id as TipoIdsDocumentos,
    );
    if (!entidade) {
      throw new NotFoundException('Fundo/Gestor/Usuário não encontrado');
    }

    const urlDocumento = await this.enviarArquivoParaServidor(arquivo);

    const statusDocumento = await this.obterStatusDocumento(
      StatusDocumento.AGUARDANDO_ANALISE,
    );
    if (!statusDocumento) {
      throw new NotFoundException('Status não encontrado');
    }

    const dadosDocumento: Documento = {
      nome_arquivo: arquivo.originalname,
      extensao: arquivo.mimetype,
      tipo_documento: enviarDocumentoDto.tipo_documento,
      data_referencia: new Date(),
      data_upload: new Date(),
      url: String(urlDocumento),
      id_status_documento: statusDocumento.id,
    };

    const documentoCriado = await this.salvarDocumento(
      dadosDocumento,
      enviarDocumentoDto.tipo_id as TipoIdsDocumentos,
      id,
    );

    return {
      path: urlDocumento,
      document_id: documentoCriado.id,
    };
  }

  async buscarTodosDocumentos() {
    return this.prisma.documento.findMany();
  }

  async buscarDocumentos(
    id: string,
    tipoId: TipoIdsDocumentos,
    idUsuario: number,
  ) {
    if (!Object.values(TipoIdsDocumentos).includes(tipoId)) {
      throw new BadRequestException('Tipo de ID inválido');
    }

    let documents = [];

    switch (tipoId) {
      case TipoIdsDocumentos.USUARIO:
        documents = await this.prisma.documento.findMany({
          where: { id_usuario: idUsuario },
          include: { status_documento: true },
        });
        break;
      case TipoIdsDocumentos.FUNDO_INVESTIMENTO:
        await this.fundosService.verificarPropriedadeFundo(idUsuario, +id);
        documents = await this.prisma.documento.findMany({
          where: { id_fundo_investimento: Number(id) },
          include: { status_documento: true },
        });
        break;
      case TipoIdsDocumentos.GESTOR_FUNDO:
        await this.verificarPropriedadeGestor(idUsuario, +id);
        documents = await this.prisma.documento.findMany({
          where: { id_gestor_fundo: Number(id) },
          include: { status_documento: true },
        });
        break;
    }

    if (documents.length === 0) {
      throw new NotFoundException('Documentos não encontrados');
    }

    return {
      message: 'Documentos retornados',
      data: { documents },
    };
  }

  async atualizarDocumento(
    id: number,
    atualizarDocumentoDto: AtualizarDocumentoDto,
    backofficeId: number,
  ) {
    const validarStatus = Object.values(StatusDocumento).map((s) =>
      s.toLowerCase(),
    );
    if (!validarStatus.includes(atualizarDocumentoDto.status.toLowerCase())) {
      throw new BadRequestException('Status não permitido');
    }

    const documento = await this.prisma.documento.findUnique({
      where: { id: Number(id) },
      select: { id: true, id_status_documento: true },
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    const encontrarStatus = await this.obterStatusDocumento(
      atualizarDocumentoDto.status.toUpperCase(),
    );

    let criarFeedBack = null;
    if (atualizarDocumentoDto.mensagem) {
      criarFeedBack = await this.prisma.feedback_backoffice.create({
        data: {
          id_usuario_backoffice: Number(backofficeId),
          mensagem: atualizarDocumentoDto.mensagem,
          id_documento: documento.id,
        },
      });
    }

    const atualizarDocumento = await this.prisma.documento.update({
      where: { id: documento.id },
      data: { id_status_documento: encontrarStatus?.id },
    });

    return {
      message_success: 'Documento atualizado',
      document: {
        status: encontrarStatus?.descricao,
        url: atualizarDocumento.url,
        file_name: atualizarDocumento.nome_arquivo,
      },
      feedback: criarFeedBack,
    };
  }

  async anexarDocumento(
    idFundo: number,
    anexarDocumentoDto: AnexarDocumentoDto,
    idUsuario: number,
  ) {
    const fundo = await this.prisma.fundo_investimento.findFirst({
      where: { id: idFundo },
    });

    if (!fundo) {
      throw new NotFoundException('Fundo não encontrado');
    }

    await this.fundosService.verificarPropriedadeFundo(idUsuario, idFundo);

    const statusEncontrado = await this.obterStatusDocumento(
      StatusDocumento.APROVADO,
    );

    const dadosDocumento: Documento = {
      extensao: anexarDocumentoDto.extensao,
      nome_arquivo: anexarDocumentoDto.nome_arquivo,
      tipo_documento: anexarDocumentoDto.tipo_documento,
      url: String(anexarDocumentoDto.url),
      data_referencia: new Date(),
      data_upload: new Date(),
      id_status_documento: statusEncontrado?.id,
    };

    const documentoSalvo = await this.salvarDocumento(
      dadosDocumento,
      TipoIdsDocumentos.FUNDO_INVESTIMENTO,
      fundo.id,
    );

    return { Documento_criado: documentoSalvo };
  }

  private async verificarPropriedadeGestor(
    idUsuario: number,
    idGestor: number,
  ) {
    const gestorFundo = await this.prisma.gestor_fundo.findUnique({
      where: { id: idGestor },
    });

    if (!gestorFundo) {
      throw new NotFoundException({
        mensagem: 'Gestor de fundo não encontrado.',
      });
    }

    const usuarioGestor =
      await this.prisma.usuario_fundo_investimento.findFirst({
        where: {
          id_usuario: idUsuario,
          fundo_investimento_gestor_fundo: {
            id_gestor_fundo: idGestor,
          },
        },
      });

    if (!usuarioGestor) {
      throw new ForbiddenException({
        mensagem: 'Acesso negado. Você não está associado a este gestor',
      });
    }

    return gestorFundo;
  }

  private async obterEntidadePorIdETipo(id: number, tipoId: TipoIdsDocumentos) {
    if (tipoId === TipoIdsDocumentos.USUARIO) {
      return this.prisma.usuario.findFirst({ where: { id } });
    }
    if (tipoId === TipoIdsDocumentos.FUNDO_INVESTIMENTO) {
      return this.prisma.fundo_investimento.findFirst({ where: { id } });
    }
    if (tipoId === TipoIdsDocumentos.GESTOR_FUNDO) {
      return this.prisma.gestor_fundo.findFirst({ where: { id } });
    }
    return null;
  }

  private async enviarArquivoParaServidor(file: Express.Multer.File) {
    try {
      const base64String = this.bufferToBase64(file.buffer);

      const requestBody = {
        arquivo: base64String,
        arquivo_nome_original: file.originalname,
        arquivo_extensao: 'pdf',
        componente_id: 113,
      };

      const response = await fetch(`${process.env.BASE_URL_COMUM_ARQUIVO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();

      return result;
    } catch (erro: any) {
      throw new InternalServerErrorException({
        mensagem:
          'Um erro innesperado aconteceu e não foi possível enviar o arquivo',
      });
    }
  }

  private async obterStatusDocumento(nome: string) {
    return this.prisma.status_documento.findFirst({
      where: { nome: nome },
    });
  }

  private async salvarDocumento(
    dadosDocumento: Documento,
    tipoId: TipoIdsDocumentos,
    id: number,
  ) {
    let campoChave: string;

    switch (tipoId) {
      case TipoIdsDocumentos.USUARIO:
        campoChave = 'id_usuario';
        break;
      case TipoIdsDocumentos.FUNDO_INVESTIMENTO:
        campoChave = 'id_fundo_investimento';
        break;
      case TipoIdsDocumentos.GESTOR_FUNDO:
        campoChave = 'id_gestor_fundo';
        break;
      default:
        throw new BadRequestException('Tipo de documento inválido');
    }

    dadosDocumento[campoChave] = id;

    return this.prisma.documento.create({ data: dadosDocumento });
  }

  private bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }
}
