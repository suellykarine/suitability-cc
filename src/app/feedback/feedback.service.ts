import { Injectable } from '@nestjs/common';
import { CriarFeedbackDto } from './dto/criar-feedback.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ErroNaoEncontrado } from 'src/helpers/erroAplicacao';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async criarFeedback(
    criarFeedbackDto: CriarFeedbackDto,
    idUsuarioBackoffice: number,
  ) {
    await this.buscarUsuarioInvestidor(criarFeedbackDto.id_usuario_investidor);

    await this.buscarDocumentos(criarFeedbackDto.id_documento);

    await this.buscarFundoInvestimento(criarFeedbackDto.id_fundo_investimento);

    await this.prisma.feedback_backoffice.create({
      data: {
        id_usuario_backoffice: idUsuarioBackoffice,
        id_usuario_investidor: criarFeedbackDto.id_usuario_investidor,
        id_documento: criarFeedbackDto.id_documento,
        id_fundo_investimento: criarFeedbackDto.id_fundo_investimento,
        mensagem: criarFeedbackDto.mensagem,
      },
    });

    return {
      mensagem: 'Feedback criado com sucesso',
    };
  }

  private async buscarDocumentos(idDocumento: number) {
    const documento = await this.prisma.documento.findUnique({
      where: { id: idDocumento },
    });

    if (!documento) {
      throw new ErroNaoEncontrado({
        acao: 'feedBackService.criarFeedBack',
        mensagem: 'Documento não encontrado',
      });
    }
  }

  private async buscarFundoInvestimento(idFundoInvestimento: number) {
    const fundo = await this.prisma.fundo_investimento.findUnique({
      where: { id: idFundoInvestimento },
    });

    if (!fundo) {
      throw new ErroNaoEncontrado({
        acao: 'feedBackService.buscarFundoInvestimento',
        mensagem: 'Fundo não encontrado',
      });
    }
  }

  private async buscarUsuarioInvestidor(idUsuarioInvestidor: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuarioInvestidor },
    });

    if (!usuario) {
      throw new ErroNaoEncontrado({
        acao: 'feedBackService.buscarUsuarioInvestidor',
        mensagem: 'Usuário investidor não encontrado',
      });
    }
  }
}
