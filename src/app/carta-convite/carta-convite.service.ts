import { Injectable } from '@nestjs/common';
import { CriarCartaConviteDto } from './dto/create-invitation-letter.dto';
import { AtualizarCartaConviteDto } from './dto/update-invitation-letter.dto';
import { status_carta_convite, usuario } from '@prisma/client';
import { StatusCartaConvite } from 'src/enums/StatusCartaConvite';
import {
  formatarCNPJ,
  formatarCPF,
  formatarTelefone,
  somenteNumeros,
} from 'src/utils/formatar';
import { customAlphabet } from 'nanoid';
import { servicoEmailSrm } from 'src/utils/servico-email-srm/servico';
import { VerificarCodigoCartaConviteDto } from './dto/verify-invitation-letter.dto';
import { ReenviarCodigoDto } from './dto/resend-code.dto';
import { SolicitacaoBase } from 'src/utils/interfaces/solicitacaoBase.interface';
import { CartaConvite } from './entities/carta-convite.entity';
import { PrismaService } from 'prisma/prisma.service';
import { fazerNada } from 'src/utils/funcoes/geral';
import {
  ErroAplicacao,
  ErroConflitoRequisicao,
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class CartaConviteService {
  constructor(private prisma: PrismaService) {}

  async criarCartaConvite(
    criarCartaConviteDto: CriarCartaConviteDto,
    id?: number,
  ) {
    criarCartaConviteDto.cnpj = somenteNumeros(criarCartaConviteDto.cnpj);
    criarCartaConviteDto.cpf = somenteNumeros(criarCartaConviteDto.cpf);
    criarCartaConviteDto.telefone = somenteNumeros(
      criarCartaConviteDto.telefone,
    );
    const logAcao = 'cartaConviteCriarCartaConvite';
    if (!criarCartaConviteDto.termosAceito) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem:
          'Você precisa aceitar os termos de uso e as políticas de privacidade para continuar.',
        detalhes: {
          criarCartaConviteDto,
        },
      });
    }

    const perfilExistente = await this.prisma.carta_convite.findFirst({
      where: { email: criarCartaConviteDto.email },
      include: {
        status_carta_convite: true,
      },
    });

    if (perfilExistente) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Carta convite já existente',
        detalhes: {
          criarCartaConviteDto,
        },
      });
    }

    await this.verificarCamposUnicos(criarCartaConviteDto);

    let statusCartaConvite = await this.prisma.status_carta_convite.findFirst({
      where: { nome: StatusCartaConvite.DESATIVADO },
    });

    const dadosCartaConvite: CartaConvite = {
      nome: criarCartaConviteDto.nome,
      empresa: criarCartaConviteDto.empresa,
      email: criarCartaConviteDto.email,
      cpf: criarCartaConviteDto.cpf,
      cnpj: criarCartaConviteDto.cnpj,
      telefone: criarCartaConviteDto.telefone,
      mensagem: criarCartaConviteDto.mensagem,
      status_carta_convite: { connect: { id: statusCartaConvite!.id } },
    };

    if (id) {
      statusCartaConvite = await this.prisma.status_carta_convite.findFirst({
        where: { nome: StatusCartaConvite.APROVADO },
      });
      dadosCartaConvite.usuario = { connect: { id } };
      dadosCartaConvite.status_carta_convite = {
        connect: { id: statusCartaConvite!.id },
      };
    } else {
      const nanoid = customAlphabet('1234567890', 6);
      const codigo = nanoid();

      const solicitacaoBase: SolicitacaoBase = {
        contentParam: {
          nome: criarCartaConviteDto.nome,
          codigo: codigo,
        },
        mail: {
          addressesCcTo: [],
          addressesTo: <string[]>[criarCartaConviteDto.email],
          emailFrom: 'srmasset@srmasset.com.br',
          subject: 'Código de verificação',
        },
        templateName:
          'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
      };

      try {
        await servicoEmailSrm(solicitacaoBase);

        const dataExpiracao = new Date();
        dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);

        const codigoVerificacaoExistente =
          await this.prisma.codigo_verificacao.findFirst({
            where: {
              email: criarCartaConviteDto.email,
            },
          });

        if (codigoVerificacaoExistente) {
          await this.prisma.codigo_verificacao.update({
            where: {
              id: codigoVerificacaoExistente.id,
            },
            data: {
              codigo: codigo,
            },
          });
        } else {
          await this.prisma.codigo_verificacao.create({
            data: {
              email: criarCartaConviteDto.email,
              codigo: codigo,
              data_expiracao: dataExpiracao,
            },
          });
        }
      } catch (erro) {
        if (erro instanceof ErroAplicacao) throw erro;
        throw new ErroServidorInterno({
          acao: logAcao,
          mensagem: 'Serviço indisponível',
          detalhes: {
            erro,
            criarCartaConviteDto,
          },
        });
      }
    }

    const cartaConviteSalva = await this.prisma.carta_convite.create({
      data: dadosCartaConvite,
      include: {
        status_carta_convite: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    return {
      mensagem: 'Carta convite criada com sucesso',
      carta_convite: cartaConviteSalva,
    };
  }

  async encontrarTodasCartasConvite() {
    const cartasConvite = await this.prisma.carta_convite.findMany({
      where: {
        status_carta_convite: {
          nome: {
            not: StatusCartaConvite.DESATIVADO,
          },
        },
      },
      include: {
        status_carta_convite: true,
      },
    });
    return {
      mensage: 'sucesso',
      cartas_convite: cartasConvite.map((cartaConvite) => {
        return {
          ...cartaConvite,
          cpf: formatarCPF(cartaConvite.cpf),
          cnpj: formatarCNPJ(cartaConvite.cnpj),
          telefone: formatarTelefone(cartaConvite.telefone),
        };
      }),
    };
  }

  async encontrarUmaCartaConvite(id: number) {
    const logAcao = 'cartaConvite.encontrarCartaConvite';
    const cartaConvite = await this.prisma.carta_convite.findFirst({
      where: {
        id,
      },
    });

    if (!cartaConvite) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Carta convite não encontrada',
        detalhes: {
          id,
          cartaConvite,
        },
      });
    }
    return cartaConvite;
  }

  async atualizarCartaConvite(
    id: number,
    atualizarCartaConviteDto: AtualizarCartaConviteDto,
  ) {
    const logAcao = 'cartaConvite.atualizarCartaConvite';
    const cartaConvite = await this.prisma.carta_convite.findUnique({
      where: {
        id: id,
      },
    });

    if (!cartaConvite) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Carta convite não encontrada',
        detalhes: {
          cartaConvite,
          atualizarCartaConviteDto,
        },
      });
    }

    if (
      cartaConvite.id_usuario &&
      atualizarCartaConviteDto.idBackoffice &&
      cartaConvite.id_usuario !== atualizarCartaConviteDto.idBackoffice
    ) {
      throw new ErroConflitoRequisicao({
        acao: logAcao,
        mensagem: 'Usuário já está sendo analisado',
        detalhes: {
          cartaConvite,
        },
      });
    }

    const camposSomenteNumeros = ['telefone', 'cpf', 'cnpj'];

    camposSomenteNumeros.forEach((field) => {
      if (atualizarCartaConviteDto[field]) {
        atualizarCartaConviteDto[field] = somenteNumeros(
          atualizarCartaConviteDto[field],
        );
      }
    });

    await this.verificarCamposUnicos(atualizarCartaConviteDto, cartaConvite);

    let statusCartaConvite: status_carta_convite | undefined | null = undefined;
    if (atualizarCartaConviteDto.status) {
      statusCartaConvite = await this.prisma.status_carta_convite.findUnique({
        where: { nome: atualizarCartaConviteDto.status! },
      });
    }

    let usuario: usuario | null | undefined = undefined;
    if (atualizarCartaConviteDto.idBackoffice) {
      usuario = await this.prisma.usuario.findUnique({
        where: { id: atualizarCartaConviteDto.idBackoffice! },
      });
    }

    const { status, idBackoffice, ...dados } = atualizarCartaConviteDto;
    fazerNada([status, idBackoffice]);

    const updatedcartaConvite = await this.prisma.carta_convite.update({
      where: { id: cartaConvite.id },
      data: {
        ...dados,
        status_carta_convite:
          statusCartaConvite !== undefined
            ? {
                connect: {
                  id: statusCartaConvite!.id,
                },
              }
            : undefined,
        usuario:
          usuario !== undefined
            ? { connect: { id: usuario!.id } }
            : { disconnect: true },
      },
    });

    return {
      mensagem: 'Carta convite atualizada',
      carta_convite: updatedcartaConvite,
    };
  }

  async removerCartaConvite(id: number) {
    const logAcao = 'cartaConvite.removerCartaConvite';
    try {
      await this.prisma.carta_convite.delete({
        where: {
          id,
        },
      });

      return;
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Carta convite não encontrada',
        detalhes: {
          erro,
          id,
        },
      });
    }
  }

  async verificarCodigo(
    verificarCodigoCartaConviteDto: VerificarCodigoCartaConviteDto,
  ) {
    const logAcao = 'cartaConvite.verificarCodigo2auth';
    const encontrarCodigoDeVerificacao =
      await this.prisma.codigo_verificacao.findFirst({
        where: {
          codigo: verificarCodigoCartaConviteDto.codigo,
          email: verificarCodigoCartaConviteDto.email,
        },
      });

    if (!encontrarCodigoDeVerificacao) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Código não encontrado',
        detalhes: {
          dados: verificarCodigoCartaConviteDto,
        },
      });
    }

    const encontrarCartaConvite = await this.prisma.carta_convite.findFirst({
      where: {
        email: encontrarCodigoDeVerificacao.email,
      },
      include: { status_carta_convite: true },
    });

    if (
      encontrarCartaConvite?.status_carta_convite!.nome ===
      StatusCartaConvite.DESATIVADO
    ) {
      const encontrarStatusAtivo =
        await this.prisma.status_carta_convite.findFirst({
          where: {
            nome: StatusCartaConvite.ATIVO,
          },
        });
      const cartaConviteAtualizada = await this.prisma.carta_convite.update({
        where: { id: encontrarCartaConvite.id },
        data: { id_status_carta_convite: encontrarStatusAtivo?.id },
      });

      return { cartaConviteAtualizada };
    }

    throw new ErroRequisicaoInvalida({
      acao: logAcao,
      mensagem: 'Carta convite já verificada',
      detalhes: {
        verificarCodigoCartaConviteDto,
      },
    });
  }

  async reenviarCodigo(reenviarCodigoDto: ReenviarCodigoDto) {
    const logAcao = 'cartaConvite.reenviarCodigo2auth';
    const codigoDeVerificacaoExistente =
      await this.prisma.codigo_verificacao.findFirst({
        where: { email: reenviarCodigoDto.email },
      });

    if (!codigoDeVerificacaoExistente) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Usuário não encontrado.',
        detalhes: {
          reenviarCodigoDto,
        },
      });
    }

    const nanoid = customAlphabet('1234567890', 6);
    const novoCodigo = nanoid();

    await this.prisma.codigo_verificacao.update({
      where: { id: codigoDeVerificacaoExistente.id },
      data: { codigo: novoCodigo },
    });

    const index = reenviarCodigoDto.email.indexOf('@');
    const nome =
      index !== -1 ? reenviarCodigoDto.email.substring(0, index) : '';

    const SolicitacaoBase = {
      contentParam: {
        nome: nome,
        codigo: novoCodigo,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: [reenviarCodigoDto.email],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: 'Código de verificação',
      },
      templateName:
        'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
    };

    await servicoEmailSrm(SolicitacaoBase);

    return { mensagem: 'Código de verificação reenviado com sucesso.' };
  }

  private async verificarCamposUnicos(
    criarCartaConviteDto: CriarCartaConviteDto | AtualizarCartaConviteDto,
    cartaConvite?: any,
  ) {
    const logAcao = 'cartaConvite.verificarCamposUnicos';
    const cartaConviteExistente = await this.prisma.carta_convite.findFirst({
      where: {
        OR: [
          { cpf: criarCartaConviteDto.cpf },
          { cnpj: criarCartaConviteDto.cnpj },
          { telefone: criarCartaConviteDto.telefone },
        ],
      },
    });

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { cpf: criarCartaConviteDto.cpf },
          { telefone: criarCartaConviteDto.telefone },
          { email: criarCartaConviteDto.email },
        ],
      },
    });

    const checkDuplicate = (condition: boolean | null, message: string) => {
      if (condition) {
        return message;
      }
    };

    const createDuplicateChecks = (
      cartaConviteExistente: any,
      usuarioExistente: any,
      criarCartaConviteDto: any,
      cartaConvite?: any,
    ) => [
      {
        condition:
          cartaConviteExistente &&
          cartaConviteExistente.email === criarCartaConviteDto.email &&
          (!cartaConvite || cartaConvite.email !== criarCartaConviteDto.email),
        message: 'Email já registrado',
      },
      {
        condition:
          cartaConviteExistente &&
          cartaConviteExistente.cnpj === criarCartaConviteDto.cnpj &&
          (!cartaConvite || cartaConvite.cnpj !== criarCartaConviteDto.cnpj),
        message: 'CNPJ já registrado',
      },
      {
        condition:
          cartaConviteExistente &&
          cartaConviteExistente.cpf === criarCartaConviteDto.cpf &&
          (!cartaConvite || cartaConvite.cpf !== criarCartaConviteDto.cpf),
        message: 'CPF já registrado',
      },
      {
        condition:
          cartaConviteExistente &&
          cartaConviteExistente.telefone === criarCartaConviteDto.telefone &&
          (!cartaConvite ||
            cartaConvite.telefone !== criarCartaConviteDto.telefone),
        message: 'Telefone já registrado',
      },
      {
        condition:
          usuarioExistente &&
          usuarioExistente.telefone === criarCartaConviteDto.telefone,
        message: 'Telefone já registrado',
      },
      {
        condition:
          usuarioExistente && usuarioExistente.cpf === criarCartaConviteDto.cpf,
        message: 'CPF já registrado',
      },
      {
        condition:
          usuarioExistente &&
          usuarioExistente.email === criarCartaConviteDto.email,
        message: 'Email já registrado',
      },
    ];

    const duplicateChecks = createDuplicateChecks(
      cartaConviteExistente,
      usuarioExistente,
      criarCartaConviteDto,
      cartaConvite,
    );

    for (const { condition, message } of duplicateChecks) {
      const response = checkDuplicate(condition, message);
      if (response) {
        throw new ErroRequisicaoInvalida({ acao: logAcao, mensagem: response });
      }
    }
  }
}
