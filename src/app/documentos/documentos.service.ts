import { Injectable } from '@nestjs/common';
import {
  AnexarDocumentoDto,
  EnviarDocumentoDto,
} from './dto/criar-documento.dto';
import { AtualizarDocumentoStatusDto } from './dto/atualizar-documento.dto';
import { StatusDocumento } from 'src/enums/StatusDocumento';
import { TipoIdsDocumentos } from 'src/enums/TipoIdsDocumentos';
import { FundosService } from '../fundos/fundos.service';
import { PrismaService } from 'prisma/prisma.service';
import { DocumentoRepositorio } from 'src/repositorios/contratos/documentoRepositorio';
import { Documento, DocumentoSemVinculo } from 'src/@types/entities/documento';
import {
  ErroAplicacao,
  ErroNaoAutorizado,
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly fundosService: FundosService,
    private prisma: PrismaService,
    private readonly documentoRepositorio: DocumentoRepositorio,
  ) {}
  async enviarDocumento(
    enviarDocumentoDto: EnviarDocumentoDto,
    arquivo: Express.Multer.File,
    id: number,
  ) {
    const entidade = await this.obterEntidadePorIdETipo(
      id,
      enviarDocumentoDto.tipo_id as TipoIdsDocumentos,
    );
    if (!entidade) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.enviarDocumento',
        mensagem: 'Fundo/Gestor/Usuário não encontrado',
        informacaoAdicional: {
          enviarDocumentoDto,
          id,
        },
      });
    }

    const urlDocumento = await this.enviarArquivoParaServidor(arquivo);

    const statusDocumento = await this.obterStatusDocumento(
      StatusDocumento.AGUARDANDO_ANALISE,
    );
    if (!statusDocumento) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.enviarDocumento',
        mensagem: 'Status não encontrado',
        informacaoAdicional: {
          enviarDocumentoDto,
          id,
          urlDocumento,
        },
      });
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
      throw new ErroRequisicaoInvalida({
        acao: 'documentos.buscarTodosDocumentos',
        mensagem: 'Tipo de ID inválido',
        informacaoAdicional: {
          id,
          tipoId,
          idUsuario,
        },
      });
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
      throw new ErroNaoEncontrado({
        acao: 'documentos.buscarDocumentos',
        mensagem: 'Documentos não encontrados',
        informacaoAdicional: {
          id,
          tipoId,
          idUsuario,
        },
      });
    }

    return {
      message: 'Documentos retornados',
      data: { documents },
    };
  }

  async atualizarStatusDocumento(
    id: number,
    atualizarDocumentoStatusDto: AtualizarDocumentoStatusDto,
    backofficeId: number,
  ) {
    const validarStatus = Object.values(StatusDocumento).map((s) =>
      s.toLowerCase(),
    );
    if (
      !validarStatus.includes(atualizarDocumentoStatusDto.status.toLowerCase())
    ) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.atualizarStatusDocumento',
        mensagem: 'Status não permitido',
        informacaoAdicional: {
          id,
          atualizarDocumentoStatusDto,
          backofficeId,
          validarStatus,
        },
      });
    }

    const documento = await this.prisma.documento.findUnique({
      where: { id: Number(id) },
      select: { id: true, id_status_documento: true },
    });

    if (!documento) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.atualizarStatusDocumento',
        mensagem: 'Documento não encontrado',
        informacaoAdicional: {
          id,
          atualizarDocumentoStatusDto,
          backofficeId,
        },
      });
    }

    const encontrarStatus = await this.obterStatusDocumento(
      atualizarDocumentoStatusDto.status.toUpperCase(),
    );

    let criarFeedBack = null;
    if (atualizarDocumentoStatusDto.mensagem) {
      criarFeedBack = await this.prisma.feedback_backoffice.create({
        data: {
          id_usuario_backoffice: Number(backofficeId),
          mensagem: atualizarDocumentoStatusDto.mensagem,
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
      throw new ErroNaoEncontrado({
        acao: 'documentos.anexarDocumento',
        mensagem: 'Fundo não encontrado',
        informacaoAdicional: {
          idUsuario,
          idFundo,
          anexarDocumentoDto,
        },
      });
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

  async atualizarDocumento(
    id: number,
    arquivo: Express.Multer.File,
    idUsuarioRequisicao: number,
  ) {
    const documento = await this.buscarDocumentoPorId(id);

    await this.verificarProprietarioDocumento(documento, idUsuarioRequisicao);

    const urlDocumento = await this.enviarArquivoParaServidor(arquivo);

    const statusDocumento = await this.obterStatusDocumento(
      StatusDocumento.AGUARDANDO_ANALISE,
    );

    const dadosDocumento: Documento = {
      nome_arquivo: arquivo.originalname,
      extensao: arquivo.mimetype,
      data_referencia: new Date(),
      data_upload: new Date(),
      url: String(urlDocumento),
      id_status_documento: statusDocumento.id,
    };

    const documentoAtualizado =
      await this.documentoRepositorio.atualizarDocumento(
        documento.id,
        dadosDocumento,
      );

    return {
      path: urlDocumento,
      document_id: documentoAtualizado.id,
    };
  }

  private async verificarPropriedadeGestor(
    idUsuario: number,
    idGestor: number,
  ) {
    const gestorFundo = await this.prisma.gestor_fundo.findUnique({
      where: { id: idGestor },
    });

    if (!gestorFundo) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.verificarPropriedadeGestor',
        mensagem: 'Gestor de fundo não encontrado.',
        informacaoAdicional: {
          idUsuario,
          idGestor,
        },
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
      throw new ErroNaoAutorizado({
        acao: 'documentos.verificarPropriedadeGestor',
        mensagem: 'Acesso negado. Você não está associado a este gestor',
        informacaoAdicional: {
          idUsuario,
          idGestor,
        },
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
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroNaoEncontrado({
        acao: 'documentos.enviarArquivoParaServidor',
        mensagem:
          'Um erro innesperado aconteceu e não foi possível enviar o arquivo',
        informacaoAdicional: {
          file,
          erro,
        },
      });
    }
  }

  private async obterStatusDocumento(nome: string) {
    return this.prisma.status_documento.findFirst({
      where: { nome: nome },
    });
  }

  private async salvarDocumento(
    dadosDocumento: DocumentoSemVinculo,
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
        throw new ErroServidorInterno({
          acao: 'documentos.salvarDocumento',
          mensagem: 'Tipo de documento inválido',
          informacaoAdicional: {
            dadosDocumento,
            tipoId,
            id,
          },
        });
    }

    dadosDocumento[campoChave] = id;

    return this.documentoRepositorio.criar(dadosDocumento);
  }

  private bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  private async buscarDocumentoPorId(idDocumento: number) {
    const documento = await this.documentoRepositorio.buscarPorId(idDocumento);

    if (!documento) {
      throw new ErroNaoEncontrado({
        acao: 'documentos.buscarDocumentoPorId',
        mensagem: 'Documento não encontrado',
        informacaoAdicional: {
          idDocumento,
        },
      });
    }

    return documento;
  }

  private async verificarProprietarioDocumento(
    documento: Documento,
    idUsuarioRequisicao: number,
  ) {
    if (documento.id_usuario && documento.id_usuario !== idUsuarioRequisicao) {
      throw new ErroNaoAutorizado({
        acao: 'documentos.verificarProprietarioDocumento',
        mensagem: 'Você não tem autorização para atualizar esse documento',
        informacaoAdicional: {
          documento,
          idUsuarioRequisicao,
        },
      });
    }

    if (documento.id_fundo_investimento) {
      await this.fundosService.verificarPropriedadeFundo(
        idUsuarioRequisicao,
        documento.id_fundo_investimento,
      );
    }
  }
}
