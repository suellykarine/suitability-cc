import { Injectable } from '@nestjs/common';
import { CreatePreRegisterDto } from './dto/create-pre-register.dto';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { FindUserPreRegisterDto } from './dto/find-user-pre-register.dto';
import { PrismaClient } from '@prisma/client';
import { formatCNPJ, formatCPF, formatPhone } from 'src/utils/format';

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

  findOne(id: number) {
    return `This action returns a #${id} preRegister`;
  }

  update(id: number, updatePreRegisterDto: UpdatePreRegisterDto) {
    return `This action updates a #${id} preRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} preRegister`;
  }
}
