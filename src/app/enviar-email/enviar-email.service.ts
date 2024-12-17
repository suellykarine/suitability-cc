import { Injectable } from '@nestjs/common';
import { EnviarEmailDto } from './dto/create-enviar-email.dto';
import { SolicitacaoBase } from 'src/utils/interfaces/solicitacaoBase.interface';
import { jwtConstants } from '../autenticacao/constants';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'prisma/prisma.service';
import {
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class EnviarEmailService {
  constructor(private prisma: PrismaService) {}

  async enviarEmail(enviarEmailDto: EnviarEmailDto) {
    const usuario = await this.obterUsuarioPorEmail(enviarEmailDto.para);
    const nomeUsuario = usuario ? usuario.nome : 'Investidor';

    const solicitacaoBase: SolicitacaoBase = this.criarSolicitacaoBase(
      enviarEmailDto,
      nomeUsuario,
    );

    await this.prepararSolicitacaoBase(
      solicitacaoBase,
      enviarEmailDto,
      usuario,
    );

    const req = await this.serviceEmailSrm(solicitacaoBase);
    if (!req) {
      throw new ErroServidorInterno({
        acao: 'enviarEmail.enviarEmail',
        mensagem: 'Serviço fora do ar momentaneamente',
        informacaoAdicional: {
          solicitacaoBase,
          enviarEmailDto,
          usuario,
        },
      });
    }
    return {
      mensagem: 'Email enviado com sucesso',
    };
  }

  private async obterUsuarioPorEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: {
        email,
      },
    });
  }

  private criarSolicitacaoBase(
    enviarEmailDto: EnviarEmailDto,
    nomeUsuario: string,
  ): SolicitacaoBase {
    return {
      contentParam: {
        nome: nomeUsuario,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: <string[]>[enviarEmailDto.para],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: enviarEmailDto.tituloDaMensagem,
      },
      templateName: '',
    };
  }

  private async prepararSolicitacaoBase(
    solicitacaoBase: SolicitacaoBase,
    enviarEmailDto: EnviarEmailDto,
    usuario,
  ) {
    switch (enviarEmailDto.tipo) {
      case 'validado':
        this.configurarTemplateValidado(solicitacaoBase);
        break;

      case 'reprovado':
        this.configurarTemplateReprovado(solicitacaoBase);
        break;

      case 'aprovado':
        await this.configurarTemplateAprovado(solicitacaoBase, enviarEmailDto);
        break;

      case 'enviarDocBackOffice':
        await this.configurarTemplateEnviarDocBackOffice(
          solicitacaoBase,
          enviarEmailDto,
          usuario,
        );
        break;

      case 'assinaturaPendente':
        this.validarCampoObrigatorio(enviarEmailDto.docsToSign, 'docsToSign');
        this.configurarTemplateAssinaturaPendente(
          solicitacaoBase,
          enviarEmailDto,
        );
        break;

      case 'redefinirSenha':
        this.validarCampoObrigatorio(enviarEmailDto.docsToSign, 'docsToSign');
        this.configurarTemplateRedefinirSenha(solicitacaoBase, enviarEmailDto);
        break;

      default:
        throw new ErroRequisicaoInvalida({
          acao: 'enviarEmail.prepararSolicitacaoBase',
          mensagem: 'Tipo de email não reconhecido',
          informacaoAdicional: {
            solicitacaoBase,
            enviarEmailDto,
            usuario,
          },
        });
    }
  }

  private configurarTemplateValidado(solicitacaoBase: SolicitacaoBase) {
    solicitacaoBase.contentParam.urlPlataforma = process.env.URL_DA_PLATAFORMA;
    solicitacaoBase.templateName =
      'credit_connect_documentacao_usuario_aprovada.html';
  }

  private configurarTemplateReprovado(solicitacaoBase: SolicitacaoBase) {
    solicitacaoBase.templateName =
      'credit_connect_usuario_trial_reprovado.html';
  }

  private async configurarTemplateAprovado(
    solicitacaoBase: SolicitacaoBase,
    enviarEmailDto: EnviarEmailDto,
  ) {
    const cartaConvite = await this.prisma.carta_convite.findFirst({
      where: {
        email: enviarEmailDto.para,
      },
    });
    const token = jwt.sign(
      { email: enviarEmailDto.para, id: cartaConvite?.id },
      jwtConstants.sercretPreRegister,
      { expiresIn: '30d' },
    );
    solicitacaoBase.contentParam.urlPlataforma = `${process.env.URL_DA_PLATAFORMA}pre-register/${token}`;
    solicitacaoBase.templateName = 'credit_connect_usuario_trial_aprovado.html';
  }

  private async configurarTemplateEnviarDocBackOffice(
    solicitacaoBase: SolicitacaoBase,
    enviarEmailDto: EnviarEmailDto,
    usuario,
  ) {
    const backOffice = await this.prisma.fundo_backoffice.findUnique({
      where: {
        email: enviarEmailDto.para,
      },
    });

    if (!backOffice) {
      throw new ErroNaoEncontrado({
        acao: 'enviarEmail.configurarTemplateEnviarDocBackoffice',
        mensagem: 'Backoffice não encontrado',
        informacaoAdicional: {
          solicitacaoBase,
          enviarEmailDto,
          usuario,
        },
      });
    }

    const tokenBackoffice = this.gerarTokenBackoffice(
      backOffice!.id,
      30,
      usuario?.id,
      usuario?.email,
    );
    solicitacaoBase.contentParam.nomeDoFundo = enviarEmailDto.nomeDoFundo;
    solicitacaoBase.contentParam.urlDocumentosBackoffice = `${process.env.URL_DA_PLATAFORMA}backoffice/${tokenBackoffice}`;
    solicitacaoBase.templateName =
      'credit_connect_email_para_backoffice_enviar_documentos_do_fundo.html';
  }

  private configurarTemplateAssinaturaPendente(
    solicitacaoBase: SolicitacaoBase,
    enviarEmailDto: EnviarEmailDto,
  ) {
    solicitacaoBase.contentParam.docusign = enviarEmailDto.docsToSign;
    solicitacaoBase.templateName = 'credit_connect_assinatura_pendente.html';
  }

  private configurarTemplateRedefinirSenha(
    solicitacaoBase: SolicitacaoBase,
    enviarEmailDto: EnviarEmailDto,
  ) {
    solicitacaoBase.contentParam.novaSenha = enviarEmailDto.docsToSign;
    solicitacaoBase.templateName = 'credit_connect_redefinir_senha.html';
  }

  private validarCampoObrigatorio(campo: any, nomeCampo: string) {
    if (!campo) {
      throw new ErroRequisicaoInvalida({
        acao: 'enviarEmail.configurarTemplateRedefinirSenha',
        mensagem: `O Campo ${nomeCampo} não pode estar vazio`,
        informacaoAdicional: {
          campo,
          nomeCampo,
        },
      });
    }
  }

  private gerarTokenBackoffice(
    idBackoffice: number,
    diasValidade = 30,
    id_usuario?: number,
    email?: string,
  ) {
    const expiracao =
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * diasValidade;
    const payload = {
      id_backoffice: idBackoffice,
      exp: expiracao,
      idUser: id_usuario,
      email: email,
    };
    const token = jwt.sign(payload, jwtConstants.secret!);
    return token;
  }

  private async serviceEmailSrm(email: SolicitacaoBase) {
    const emailData: SolicitacaoBase = {
      contentParam: {
        nome: email.contentParam.nome,
        docusign: email.contentParam.docusign,
        nomeDoFundo: email.contentParam.nomeDoFundo,
        urlDocumentosBackoffice: email.contentParam.urlDocumentosBackoffice,
        urlPlataforma: email.contentParam.urlPlataforma,
        codigo: email.contentParam.codigo,
        novaSenha: email.contentParam.novaSenha,
      },
      mail: {
        addressesCcTo: email.mail.addressesCcTo || [],
        addressesTo: email.mail.addressesTo,
        emailFrom: email.mail.emailFrom || 'srmasset@srmasset.com.br',
        subject: email.mail.subject,
      },
      origin: email.origin || 'SRM',
      sendType: email.sendType || 'LOTE',
      templateName: email.templateName,
    };

    const res = await fetch(
      `${process.env.SRM_EMAIL_URL}/v1/email/send-template`,
      {
        method: 'POST',
        body: JSON.stringify(emailData),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!res.ok) {
      return;
    }
    return res;
  }
}
