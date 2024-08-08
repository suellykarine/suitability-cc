import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient, usuario, Prisma } from '@prisma/client';
import {
  formatarCPF,
  formatarCNPJ,
  formatarTelefone,
} from 'src/utils/formatar';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { StatusGestorFundo } from 'src/enums/StatusGestorFundo';
import {
  CriarCodigoDeVerificacaoDto,
  CriarUsuarioDto,
} from './dto/criar-pre-registro.dto';
import * as bcrypt from 'bcrypt';
import { StatusCartaConvite } from 'src/enums/StatusCartaConvite';
import { customAlphabet } from 'nanoid';
import { servicoEmailSrm } from 'src/utils/servico-email-srm/servico';
import { SolicitacaoBase } from 'src/utils/interfaces/solicitacaoBase.interface';

@Injectable()
export class PreRegistroService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async encontrarTodosUsuarios() {
    const usuarios = await this.prisma.usuario.findMany({
      include: {
        tipo_usuario: true,
        gestor_fundo: true,
        status_usuario: true,
      },
    });
    const usuariosSemSenha = usuarios.map((usuario) => {
      const { senha, ...usuariosSemSenha } = usuario;
      return usuariosSemSenha;
    });
    return {
      mensagem: 'successo',
      usuarios: usuariosSemSenha.map((usuario: any) => {
        return {
          ...usuario,
          cpf: formatarCPF(usuario.cpf),
          telefone: formatarTelefone(usuario.telefone),
          gestor_fundo: usuario.gestor_fundo
            ? {
                ...usuario.gestor_fundo,
                cnpj: formatarCNPJ(usuario.gestor_fundo.cnpj),
              }
            : undefined,
        };
      }),
    };
  }

  async encontrarUmUsuario(id: number, idUsuarioRequisicao: number) {
    const usuarioRequisicao = await this.prisma.usuario.findUnique({
      where: {
        id: idUsuarioRequisicao,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: id,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new UnauthorizedException(donoAdminOuBackoffice);
    }

    const { senha, ...usuarioSemSenha } = usuario;
    return {
      mensagem: 'successo',
      usuario: {
        ...usuarioSemSenha,
        cpf: formatarCPF(usuarioSemSenha.cpf!),
        telefone: formatarTelefone(usuarioSemSenha.telefone!),
      },
    };
  }

  async removerUsuario(id: number, idUsuarioRequisicao: number) {
    const usuario: usuario | null = await this.prisma.usuario.findUnique({
      where: { id: id },
      include: {
        status_usuario: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException({
        success: false,
        mensagem: 'Usuário não encontrado',
        status: 404,
      });
    }

    const usuarioRequisicao = await this.prisma.usuario.findUnique({
      where: {
        id: idUsuarioRequisicao,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new UnauthorizedException(donoAdminOuBackoffice);
    }

    const statusDesativado = await this.prisma.status_usuario.findFirst({
      where: {
        nome: StatusUsuario.DESATIVADO,
      },
    });
    if (!statusDesativado) {
      throw new NotFoundException({
        success: false,
        mensagem: 'Status de usuário não encontrado',
        status: 404,
      });
    }
    const usuarioDesativado =
      usuario.id_status_usuario === statusDesativado.id ? true : false;
    if (usuarioDesativado) {
      throw new BadRequestException({
        mensagem: 'Usuário já está inativo',
      });
    }
    await this.prisma.usuario.update({
      where: { id: id },
      data: { id_status_usuario: statusDesativado.id },
    });
  }
  async criarUsuario(
    criarUsuarioDto: CriarUsuarioDto,
    cartaConvite: any,
    token: string,
  ) {
    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const id = cartaConvite.id;
        const encontrarCartaConvite = await prisma.carta_convite.findFirst({
          where: {
            id,
            status_carta_convite: {
              nome: StatusCartaConvite.APROVADO,
            },
          },
          include: {
            status_carta_convite: true,
          },
        });

        if (!encontrarCartaConvite) {
          throw new NotFoundException({
            mensagem: 'Carta convite não encontrada ou não aprovada',
          });
        }

        const statusUsuario = await prisma.status_usuario.findFirst({
          where: {
            nome: StatusUsuario.PRIMEIRO_ACESSO,
          },
        });
        const statusGestor = await prisma.status_gestor_fundo.findFirst({
          where: {
            nome: StatusGestorFundo.APROVADO,
          },
        });
        const tipoUsuario = await prisma.tipo_usuario.findFirst({
          where: {
            tipo: TipoUsuario.INVESTIDOR_TRIAL,
          },
        });

        if (!statusGestor || !tipoUsuario || !statusUsuario) {
          throw new NotFoundException({
            mensagem: 'Status não encontrado',
          });
        }

        const senhaEmHash = await bcrypt.hash(criarUsuarioDto.senha, 10);
        const encontrarGestor = await prisma.gestor_fundo.findFirst({
          where: { cnpj: encontrarCartaConvite.cnpj },
        });
        let gestorSalvo;
        if (encontrarGestor) {
          gestorSalvo = encontrarGestor;
        } else {
          gestorSalvo = await prisma.gestor_fundo.create({
            data: {
              cnpj: encontrarCartaConvite.cnpj,
              nome_fantasia: encontrarCartaConvite?.empresa,
              status_gestor_fundo: {
                connect: {
                  id: statusGestor.id,
                },
              },
            },
          });
        }

        const usuarioSalvo = await prisma.usuario.create({
          data: {
            nome: encontrarCartaConvite.nome,
            cpf: encontrarCartaConvite.cpf,
            telefone: encontrarCartaConvite.telefone,
            email: encontrarCartaConvite.email,
            senha: senhaEmHash!,
            tipo_usuario: {
              connect: {
                id: tipoUsuario.id,
              },
            },
            status_usuario: {
              connect: {
                id: statusUsuario.id,
              },
            },
            gestor_fundo: {
              connect: {
                id: gestorSalvo.id,
              },
            },
          },
          include: {
            tipo_usuario: true,
            gestor_fundo: true,
            status_usuario: true,
          },
        });

        await prisma.token_usado.create({
          data: {
            token: token,
            data_criacao: new Date(
              Number(cartaConvite.iat) * 1000,
            ).toISOString(),
          },
        });

        const { senha: _, ...usuarioSemSenha } = usuarioSalvo;
        return {
          mensagem: 'Criado',
          usuario: usuarioSemSenha,
        };
      },
    );
  }

  async encontrarCartaConvite(invitationLetter: any) {
    const cartaConvite = await this.prisma.carta_convite.findFirst({
      where: {
        id: invitationLetter.id,
      },
    });

    if (cartaConvite) {
      return {
        carta_convite: {
          ...cartaConvite,
          cpf: formatarCPF(cartaConvite.cpf!),
          cnpj: formatarCNPJ(cartaConvite.cnpj!),
          telefone: formatarTelefone(cartaConvite.telefone!),
        },
      };
    }

    throw new NotFoundException({
      mensagem: 'Carta convite não encontrada',
    });
  }

  async enviarCodigoDeVerificacao(
    criarCodigoDeVerificacaoDto: CriarCodigoDeVerificacaoDto,
  ) {
    if (!criarCodigoDeVerificacaoDto.email) {
      throw new BadRequestException({
        mensagem: 'O campo de e-mail é obrigatório.',
      });
    }
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const codigo = nanoid();

    const requestBase: SolicitacaoBase = {
      contentParam: {
        nome: 'Investidor',
        codigo: codigo,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: <string[]>[criarCodigoDeVerificacaoDto.email],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: 'Código de verificação',
      },
      templateName:
        'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
    };
    try {
      await servicoEmailSrm(requestBase);
    } catch (error) {
      throw new ServiceUnavailableException({
        mensagem: 'Serviço de e-mail indisponível.',
      });
    }

    const codigoDeVerificacaoExistente =
      await this.prisma.codigo_verificacao.findFirst({
        where: {
          email: criarCodigoDeVerificacaoDto.email,
        },
      });

    if (codigoDeVerificacaoExistente) {
      await this.prisma.codigo_verificacao.update({
        where: {
          id: codigoDeVerificacaoExistente.id,
        },
        data: {
          codigo: codigo,
        },
      });
    } else {
      const dataExpiracao = new Date();
      dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);
      await this.prisma.codigo_verificacao.create({
        data: {
          email: criarCodigoDeVerificacaoDto.email,
          codigo: codigo,
          data_expiracao: dataExpiracao,
        },
      });
    }

    return { mensagem: 'Código de verificação enviado com sucesso.' };
  }
  private donoAdminOuBackoffice(usuario: usuario, tokenUsuario: any) {
    if (
      usuario.id !== tokenUsuario.id &&
      tokenUsuario.tipo_usuario.tipo !== TipoUsuario.BACKOFFICE &&
      tokenUsuario.tipo_usuario.tipo !== TipoUsuario.ADMINISTRADOR_SISTEMAS
    ) {
      return {
        mensagem: 'Não autorizado',
      };
    }
  }
}
