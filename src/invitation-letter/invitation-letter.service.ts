import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateInvitationLetterDto } from './dto/create-invitation-letter.dto';
import { UpdateInvitationLetterDto } from './dto/update-invitation-letter.dto';
import { PrismaClient, status_carta_convite, usuario } from '@prisma/client';
import { StatusCartaConvite } from 'src/enums/StatusCartaConvite';
import {
  formatCNPJ,
  formatCPF,
  formatPhone,
  onlyNumbers,
} from 'src/utils/format';
import { customAlphabet } from 'nanoid';
import { serviceEmailSrm } from 'src/utils/service-email-srm/service';
import { CartaConviteData, RequestBase } from './interfaces/interfaces';

@Injectable()
export class InvitationLetterService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(
    createInvitationLetterDto: CreateInvitationLetterDto,
    id?: number,
  ) {
    createInvitationLetterDto.cnpj = onlyNumbers(
      createInvitationLetterDto.cnpj,
    );
    createInvitationLetterDto.cpf = onlyNumbers(createInvitationLetterDto.cpf);
    createInvitationLetterDto.telefone = onlyNumbers(
      createInvitationLetterDto.telefone,
    );

    if (!createInvitationLetterDto.termosAceito) {
      throw new BadRequestException({
        mensagem:
          'Você precisa aceitar os termos de uso e as políticas de privacidade para continuar.',
      });
    }

    const hasWaitingProfile = await this.prisma.carta_convite.findFirst({
      where: { email: createInvitationLetterDto.email },
      include: {
        status_carta_convite: true,
      },
    });

    if (hasWaitingProfile) {
      throw new BadRequestException({
        mensagem: 'Carta convite já existente',
      });
    }

    await this.checkUniqueFields(createInvitationLetterDto);

    let status_invitation_letter =
      await this.prisma.status_carta_convite.findFirst({
        where: { nome: StatusCartaConvite.DESATIVADO },
      });

    const invitationLetterData: CartaConviteData = {
      nome: createInvitationLetterDto.nome,
      empresa: createInvitationLetterDto.empresa,
      email: createInvitationLetterDto.email,
      cpf: createInvitationLetterDto.cpf,
      cnpj: createInvitationLetterDto.cnpj,
      telefone: createInvitationLetterDto.telefone,
      mensagem: createInvitationLetterDto.mensagem,
      status_carta_convite: { connect: { id: status_invitation_letter!.id } },
    };

    if (id) {
      status_invitation_letter =
        await this.prisma.status_carta_convite.findFirst({
          where: { nome: StatusCartaConvite.APROVADO },
        });
      invitationLetterData.usuario = { connect: { id } };
      invitationLetterData.status_carta_convite = {
        connect: { id: status_invitation_letter!.id },
      };
    } else {
      const nanoid = customAlphabet(
        '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        6,
      );
      const code = nanoid();

      const requestBase: RequestBase = {
        contentParam: {
          nome: createInvitationLetterDto.nome,
          codigo: code,
        },
        mail: {
          addressesCcTo: [],
          addressesTo: <string[]>[createInvitationLetterDto.email],
          emailFrom: 'srmasset@srmasset.com.br',
          subject: 'Código de verificação',
        },
        templateName:
          'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
      };

      try {
        await serviceEmailSrm(requestBase);

        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 30);

        const existingVerificationCode =
          await this.prisma.codigo_verificacao.findFirst({
            where: {
              email: createInvitationLetterDto.email,
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
          await this.prisma.codigo_verificacao.create({
            data: {
              email: createInvitationLetterDto.email,
              codigo: code,
              data_expiracao: expirationTime,
            },
          });
        }
      } catch (error) {
        throw new ServiceUnavailableException({
          mensagem: 'Serviço indisponível',
        });
      }
    }

    const savedInvitationLetter = await this.prisma.carta_convite.create({
      data: invitationLetterData,
      include: {
        status_carta_convite: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    return {
      mensagem: 'Carta convite criada com sucesso',
      carta_convite: savedInvitationLetter,
    };
  }

  async findAll() {
    let invitationLetters = await this.prisma.carta_convite.findMany({
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
      cartas_convite: invitationLetters.map((invitationLetter) => {
        return {
          ...invitationLetter,
          cpf: formatCPF(invitationLetter.cpf),
          cnpj: formatCNPJ(invitationLetter.cnpj),
          telefone: formatPhone(invitationLetter.telefone),
        };
      }),
    };
  }

  async findOne(id: number) {
    const invitationLetter = await this.prisma.carta_convite.findFirst({
      where: {
        id,
      },
    });

    if (!invitationLetter) {
      throw new NotFoundException({
        mensagem: 'Carta convite não encontrada',
      });
    }
    return invitationLetter;
  }

  async update(
    id: number,
    updateInvitationLetterDto: UpdateInvitationLetterDto,
  ) {
    const invitationLetter = await this.prisma.carta_convite.findUnique({
      where: {
        id: id,
      },
    });

    if (!invitationLetter) {
      throw new NotFoundException({ erro: 'Carta convite não encontrada' });
    }

    if (
      invitationLetter.id_usuario &&
      updateInvitationLetterDto.idBackoffice &&
      invitationLetter.id_usuario !== updateInvitationLetterDto.idBackoffice
    ) {
      throw new ConflictException({
        error: 'Usuário já está sendo analisado',
      });
    }

    let statusInvitationLetter: status_carta_convite | undefined | null =
      undefined;
    if (updateInvitationLetterDto.status) {
      statusInvitationLetter =
        await this.prisma.status_carta_convite.findUnique({
          where: { nome: updateInvitationLetterDto.status! },
        });
    }

    let user: usuario | null | undefined = undefined;
    if (updateInvitationLetterDto.idBackoffice) {
      user = await this.prisma.usuario.findUnique({
        where: { id: updateInvitationLetterDto.idBackoffice! },
      });
    }

    const onlyNumbersFields = ['telefone', 'cpf', 'cnpj'];

    onlyNumbersFields.forEach((field) => {
      if (updateInvitationLetterDto[field]) {
        updateInvitationLetterDto[field] = onlyNumbers(
          updateInvitationLetterDto[field],
        );
      }
    });

    const { status, idBackoffice, ...data } = updateInvitationLetterDto;

    const updatedInvitationLetter = await this.prisma.carta_convite.update({
      where: { id: invitationLetter.id },
      data: {
        ...data,
        status_carta_convite:
          statusInvitationLetter !== undefined
            ? {
                connect: {
                  id: statusInvitationLetter!.id,
                },
              }
            : undefined,
        usuario:
          user !== undefined
            ? { connect: { id: user!.id } }
            : { disconnect: true },
      },
    });

    return {
      mensagem: 'Carta convite atualizada',
      carta_convite: updatedInvitationLetter,
    };
  }

  async remove(id: number) {
    try {
      await this.prisma.carta_convite.delete({
        where: {
          id,
        },
      });

      return {
        mensagem: 'Carta convite deletada com sucesso',
      };
    } catch {
      throw new NotFoundException({
        mensagem: 'Carta convite não encontrada',
      });
    }
  }

  private async checkUniqueFields(
    createInvitationLetterDto: CreateInvitationLetterDto,
  ) {
    const existingCartaConvite = await this.prisma.carta_convite.findFirst({
      where: {
        OR: [
          { cpf: createInvitationLetterDto.cpf },
          { cnpj: createInvitationLetterDto.cnpj },
          { telefone: createInvitationLetterDto.telefone },
        ],
      },
    });

    const existingUsuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { cpf: createInvitationLetterDto.cpf },
          { telefone: createInvitationLetterDto.telefone },
          { email: createInvitationLetterDto.email },
        ],
      },
    });

    const existingGestorFundo = await this.prisma.gestor_fundo.findFirst({
      where: { cnpj: createInvitationLetterDto.cnpj },
    });

    const checkDuplicate = (condition: boolean | null, message: string) => {
      if (condition) {
        return message;
      }
    };

    const duplicateChecks = [
      {
        condition:
          existingCartaConvite &&
          existingCartaConvite.cnpj === createInvitationLetterDto.cnpj,
        message: 'CNPJ já registrado',
      },
      {
        condition:
          existingCartaConvite &&
          existingCartaConvite.cpf === createInvitationLetterDto.cpf,
        message: 'CPF já registrado',
      },
      {
        condition:
          existingCartaConvite &&
          existingCartaConvite.telefone === createInvitationLetterDto.telefone,
        message: 'Telefone já registrado',
      },
      {
        condition:
          existingUsuario &&
          existingUsuario.telefone === createInvitationLetterDto.telefone,
        message: 'Telefone já registrado',
      },
      {
        condition:
          existingUsuario &&
          existingUsuario.cpf === createInvitationLetterDto.cpf,
        message: 'CPF já registrado',
      },
      {
        condition:
          existingUsuario &&
          existingUsuario.email === createInvitationLetterDto.email,
        message: 'Email já registrado',
      },
      {
        condition:
          existingGestorFundo &&
          existingGestorFundo.cnpj === createInvitationLetterDto.cnpj,
        message: 'CNPJ já registrado',
      },
    ];

    for (const { condition, message } of duplicateChecks) {
      const response = checkDuplicate(condition, message);
      if (response) {
        throw new BadRequestException({ mensagem: response });
      }
    }
  }
}
