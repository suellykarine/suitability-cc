import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { PrismaClient, usuario, Prisma } from '@prisma/client';
import { formatCNPJ, formatCPF, formatPhone } from 'src/utils/format';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { decodeToken } from 'src/utils/extractId';
import { StatusGestorFundo } from 'src/enums/StatusGestorFundo';
import {
  CreatePreRegisterDto,
  CreateVerificationCodeDto,
} from './dto/create-pre-register.dto';
import * as bcrypt from 'bcrypt';
import { StatusCartaConvite } from 'src/enums/StatusCartaConvite';
import { customAlphabet } from 'nanoid';
import { RequestBase } from 'src/invitation-letter/interfaces/interfaces';
import { serviceEmailSrm } from 'src/utils/service-email-srm/service';

@Injectable()
export class PreRegisterService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      include: {
        tipo_usuario: true,
        gestor_fundo: true,
        status_usuario: true,
      },
    });
    const usersWithoutPassword = users.map((user) => {
      const { senha, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    return {
      mensagem: 'successo',
      usuarios: usersWithoutPassword.map((user: any) => {
        return {
          ...user,
          cpf: formatCPF(user.cpf),
          telefone: formatPhone(user.telefone),
          gestor_fundo: user.gestor_fundo
            ? {
                ...user.gestor_fundo,
                cnpj: formatCNPJ(user.gestor_fundo.cnpj),
              }
            : undefined,
        };
      }),
    };
  }

  async findOne(id: number, requestUserId: number) {
    const requestuser = await this.prisma.usuario.findUnique({
      where: {
        id: requestUserId,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const user = await this.prisma.usuario.findUnique({
      where: {
        id: id,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const isOwnerOrAdminOrBackoffice = this.isOwnerOrAdminOrBackoffice(
      user,
      requestuser,
    );
    if (isOwnerOrAdminOrBackoffice) {
      throw new UnauthorizedException(isOwnerOrAdminOrBackoffice);
    }

    const { senha, ...userWithoutPassword } = user;
    return {
      mensagem: 'successo',
      usuario: {
        ...userWithoutPassword,
        cpf: formatCPF(userWithoutPassword.cpf!),
        telefone: formatPhone(userWithoutPassword.telefone!),
      },
    };
  }

  async remove(id: number, token: string, requestUserId: number) {
    const user: usuario | null = await this.prisma.usuario.findUnique({
      where: { id: id },
      include: {
        status_usuario: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        mensagem: 'Usuário não encontrado',
        status: 404,
      });
    }

    const requestuser = await this.prisma.usuario.findUnique({
      where: {
        id: requestUserId,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    const isOwnerOrAdminOrBackoffice = this.isOwnerOrAdminOrBackoffice(
      user,
      requestuser,
    );
    if (isOwnerOrAdminOrBackoffice) {
      throw new UnauthorizedException(isOwnerOrAdminOrBackoffice);
    }

    const inactiveStatus = await this.prisma.status_usuario.findFirst({
      where: {
        nome: StatusUsuario.DESATIVADO,
      },
    });
    if (!inactiveStatus) {
      throw new NotFoundException({
        success: false,
        mensagem: 'Status de usuário não encontrado',
        status: 404,
      });
    }
    const isInactiveUser =
      user.id_status_usuario === inactiveStatus.id ? true : false;
    if (isInactiveUser) {
      throw new BadRequestException({
        success: false,
        mensagem: 'Usuário já está inativo',
        status: 400,
      });
    }
    await this.prisma.usuario.update({
      where: { id: id },
      data: { id_status_usuario: inactiveStatus.id },
    });
  }
  async createUser(
    createPreRegisterDto: CreatePreRegisterDto,
    invitationLetter: any,
    token: string,
  ) {
    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const id = invitationLetter.id;
        const findInvitationLetter = await prisma.carta_convite.findFirst({
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

        if (!findInvitationLetter) {
          throw new NotFoundException({
            mensagem: 'Carta convite não encontrada ou não aprovada',
          });
        }

        const statusUser = await prisma.status_usuario.findFirst({
          where: {
            nome: StatusUsuario.PRIMEIRO_ACESSO,
          },
        });
        const statusGestor = await prisma.status_gestor_fundo.findFirst({
          where: {
            nome: StatusGestorFundo.APROVADO,
          },
        });
        const type_user = await prisma.tipo_usuario.findFirst({
          where: {
            tipo: TipoUsuario.INVESTIDOR_TRIAL,
          },
        });

        if (!statusGestor || !type_user || !statusUser) {
          throw new NotFoundException({
            mensagem: 'Status não encontrado',
          });
        }

        const hashedPassword = await bcrypt.hash(
          createPreRegisterDto.senha,
          10,
        );
        const isManagerExist = await prisma.gestor_fundo.findFirst({
          where: { cnpj: findInvitationLetter.cnpj },
        });
        let savedManager;
        if (isManagerExist) {
          savedManager = isManagerExist;
        } else {
          savedManager = await prisma.gestor_fundo.create({
            data: {
              cnpj: findInvitationLetter.cnpj,
              nome_fantasia: findInvitationLetter?.empresa,
              status_gestor_fundo: {
                connect: {
                  id: statusGestor.id,
                },
              },
            },
          });
        }

        const savedUser = await prisma.usuario.create({
          data: {
            nome: findInvitationLetter.nome,
            cpf: findInvitationLetter.cpf,
            telefone: findInvitationLetter.telefone,
            email: findInvitationLetter.email,
            senha: hashedPassword!,
            tipo_usuario: {
              connect: {
                id: type_user.id,
              },
            },
            status_usuario: {
              connect: {
                id: statusUser.id,
              },
            },
            gestor_fundo: {
              connect: {
                id: savedManager.id,
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
              Number(invitationLetter.iat) * 1000,
            ).toISOString(),
          },
        });

        const { senha: _, ...userWithoutPassword } = savedUser;
        return {
          mensagem: 'Criado',
          usuario: userWithoutPassword,
        };
      },
    );
  }

  async findLetter(invitationLetter: any) {
    const findInvitationLetter = await this.prisma.carta_convite.findFirst({
      where: {
        id: invitationLetter.id,
      },
    });

    if (findInvitationLetter) {
      return {
        carta_convite: {
          ...findInvitationLetter,
          cpf: formatCPF(findInvitationLetter.cpf!),
          cnpj: formatCNPJ(findInvitationLetter.cnpj!),
          telefone: formatPhone(findInvitationLetter.telefone!),
        },
      };
    }

    throw new NotFoundException({
      mensagem: 'Carta convite não encontrada',
    });
  }

  async sendVerificationCode(
    createVerificationCodeDto: CreateVerificationCodeDto,
  ) {
    if (!createVerificationCodeDto.email) {
      throw new BadRequestException({
        mensagem: 'O campo de e-mail é obrigatório.',
      });
    }
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const code = nanoid();

    const requestBase: RequestBase = {
      contentParam: {
        nome: 'Investidor',
        codigo: code,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: <string[]>[createVerificationCodeDto.email],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: 'Código de verificação',
      },
      templateName:
        'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
    };
    try {
      await serviceEmailSrm(requestBase);
    } catch (error) {
      throw new ServiceUnavailableException({
        mensagem: 'Serviço de e-mail indisponível.',
      });
    }

    const existingVerificationCode =
      await this.prisma.codigo_verificacao.findFirst({
        where: {
          email: createVerificationCodeDto.email,
        },
      });

    if (existingVerificationCode) {
      await this.prisma.codigo_verificacao.update({
        where: {
          id: existingVerificationCode.id,
        },
        data: {
          codigo: code,
        },
      });
    } else {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 30);
      await this.prisma.codigo_verificacao.create({
        data: {
          email: createVerificationCodeDto.email,
          codigo: code,
          data_expiracao: expirationTime,
        },
      });
    }

    return { mensagem: 'Código de verificação enviado com sucesso.' };
  }
  private isOwnerOrAdminOrBackoffice(user: usuario, userToken: any) {
    if (
      user.id !== userToken.id &&
      userToken.tipo_usuario.tipo !== TipoUsuario.BACKOFFICE &&
      userToken.tipo_usuario.tipo !== TipoUsuario.ADMINISTRADOR_SISTEMAS
    ) {
      return {
        mensagem: 'Não autorizado',
      };
    }
  }
}
