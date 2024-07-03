import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePreRegisterDto } from './dto/create-pre-register.dto';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { PrismaClient, usuario } from '@prisma/client';
import { formatCNPJ, formatCPF, formatPhone } from 'src/utils/format';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { decodeToken } from 'src/utils/extractId';

@Injectable()
export class PreRegisterService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  create(createPreRegisterDto: CreatePreRegisterDto) {
    return 'This action adds a new preRegister';
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
          gestor_fundo: {
            ...user.gestor_fundo,
            cnpj: formatCNPJ(user.gestor_fundo.cnpj),
          },
        };
      }),
    };
  }

  async findOne(id: number) {
    const prisma = new PrismaClient();
    const user = await prisma.usuario.findUnique({
      where: {
        id: id,
      },
      include: {
        tipo_usuario: true,
        status_usuario: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        mensagem: 'Usuário não encontrado',
      });
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

  update(id: number, updatePreRegisterDto: UpdatePreRegisterDto) {
    return `This action updates a #${id} preRegister`;
  }

  async remove(id: number, token: string) {
    const user: usuario | null = await this.prisma.usuario.findUnique({
      where: { id: id },
      include: {
        status_usuario: true,
      },
    });

    const idFromToken = decodeToken(token);

    const userFromToken = await this.prisma.usuario.findUnique({
      where: {
        id: idFromToken,
      },
      include: {
        tipo_usuario: true,
      },
    });

    const isOwnerOrAdmin = this.isOwnerOrAdmin(user, userFromToken);
    if (isOwnerOrAdmin) {
      throw new UnauthorizedException(isOwnerOrAdmin);
    }

    return;

    if (!user) {
      throw new NotFoundException({
        success: false,
        mensagem: 'Usuário não encontrado',
        status: 404,
      });
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

  private isOwnerOrAdmin(user: usuario, userToken: any) {
    if (
      user.id !== userToken.id &&
      userToken.tipo_usuario.tipo !== TipoUsuario.BACKOFFICE &&
      userToken.tipo_usuario.tipo !== TipoUsuario.ADMINISTRADOR_SISTEMAS
    ) {
      return {
        mensagem: 'Você não possui autorização para remover esse usuário',
      };
    }
  }
}
