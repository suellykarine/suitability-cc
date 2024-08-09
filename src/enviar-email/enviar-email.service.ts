import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EnviarEmailDto } from './dto/create-enviar-email.dto';
import { PrismaClient } from '@prisma/client';
import { SolicitacaoBase } from 'src/utils/interfaces/solicitacaoBase.interface';
import { jwtConstants } from 'src/auth/constants';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EnviarEmailService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async enviarEmail(enviarEmailDto: EnviarEmailDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: enviarEmailDto.para,
      },
    });

    const nomeUsuario = usuario ? usuario.nome : 'Investidor';
    const solicitacaoBase: SolicitacaoBase = {
      contentParam: {
        nome: nomeUsuario!,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: <string[]>[enviarEmailDto.para],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: enviarEmailDto.tituloDaMensagem,
      },
      templateName: '',
    };

    switch (enviarEmailDto.tipo) {
      case 'validado':
        solicitacaoBase.contentParam.urlPlataforma =
          process.env.URL_DA_PLATAFORMA;
        solicitacaoBase.templateName =
          'credit_connect_documentacao_usuario_aprovada.html';
        break;

      case 'reprovado':
        solicitacaoBase.templateName =
          'credit_connect_usuario_trial_reprovado.html';
        break;

      case 'aprovado':
        const cartaConvite = await this.prisma.carta_convite.findFirst({
          where: {
            email: enviarEmailDto.para,
          },
        });
        const token = jwt.sign(
          { email: enviarEmailDto.para, id: cartaConvite?.id },
          jwtConstants.sercretPreRegister,
          {
            expiresIn: '30d',
          },
        );
        const url = `${process.env.URL_DA_PLATAFORMA}pre-register/${token}`;
        solicitacaoBase.contentParam.urlPlataforma = url;
        solicitacaoBase.templateName =
          'credit_connect_usuario_trial_aprovado.html';
        break;

      case 'enviarDocBackOffice':
        const backOffice = await this.prisma.fundo_backoffice.findUnique({
          where: {
            email: enviarEmailDto.para,
          },
        });
        const tokenBackoffice = this.gerarTokenBackoffice(
          backOffice!.id,
          30,
          usuario?.id,
          usuario?.email!,
        );
        const urlBackoffice = `${process.env.URL_DA_PLATAFORMA}/backoffice/${tokenBackoffice}`;
        solicitacaoBase.contentParam.nomeDoFundo = enviarEmailDto.nomeDoFundo;
        solicitacaoBase.contentParam.urlDocumentosBackoffice = urlBackoffice;
        solicitacaoBase.templateName =
          'credit_connect_email_para_backoffice_enviar_documentos_do_fundo.html';
        break;

      case 'assinaturaPendente':
        if (!enviarEmailDto.docsToSign) {
          throw new BadRequestException({
            mensagem: 'O Campo docsToSign não pode estar vazio',
          });
        }
        solicitacaoBase.contentParam.docusign = enviarEmailDto.docsToSign;
        solicitacaoBase.templateName =
          'credit_connect_assinatura_pendente.html';
        break;

      case 'redefinirSenha':
        if (!enviarEmailDto.docsToSign) {
          throw new BadRequestException({
            mensagem: 'O Campo docsToSign não pode estar vazio',
          });
        }
        solicitacaoBase.contentParam.novaSenha = enviarEmailDto.docsToSign;
        solicitacaoBase.templateName = 'credit_connect_redefinir_senha.html';
        break;

      default:
        throw new BadRequestException({
          mensage: 'Tipo de email não reconhecido',
        });
    }

    const resposta = await this.serviceEmailSrm(solicitacaoBase);
    if (!resposta) {
      throw new ServiceUnavailableException({
        mensagem: 'Serviço fora do ar momentaneamente',
      });
    }
    return {
      mensagem: 'Email enviado com sucesso',
    };
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
      const response = await res.json();
      console.log(response);
      return;
    }
    return res;
  }
}
