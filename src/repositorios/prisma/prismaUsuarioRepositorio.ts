import { BadRequestException, Injectable } from '@nestjs/common';
import { AtualizarUsuarioDto } from 'src/adm/dto/update-adm.dto';
import { usuario } from '@prisma/client';
import { UsuarioRepositorioContract } from '../contratos/usuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/criar-usuario.dto';

@Injectable()
export class PrismaUsuarioRepositorio implements UsuarioRepositorioContract {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarTodos(): Promise<usuario[]> {
    return this.prisma.usuario.findMany();
  }

  async encontrarPorId(id: number): Promise<usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async criar(data: CreateUsuarioDto): Promise<usuario> {
    const tipoUsuario = await this.prisma.tipo_usuario.findFirst({
      where: {
        tipo: data.tipo_usuario,
      },
    });

    if (!tipoUsuario) {
      throw new BadRequestException(
        `Tipo de usuário '${data.tipo_usuario}' não encontrado.`,
      );
    }

    return this.prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
        cpf: data.cpf,
        tipo_usuario: {
          connect: {
            id: tipoUsuario.id,
          },
        },
      },
    });
  }

  async atualizar(id: number, data: AtualizarUsuarioDto): Promise<usuario> {
    const tipoUsuario = await this.prisma.tipo_usuario.findFirst({
      where: {
        tipo: data.tipo_usuario,
      },
    });

    if (!tipoUsuario) {
      throw new BadRequestException(
        `Tipo de usuário '${data.tipo_usuario}' não encontrado.`,
      );
    }
    return this.prisma.usuario.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
        cpf: data.cpf,
        tipo_usuario: {
          connect: {
            id: tipoUsuario.id,
          },
        },
      },
    });
  }

  async deletar(id: number): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }
}
