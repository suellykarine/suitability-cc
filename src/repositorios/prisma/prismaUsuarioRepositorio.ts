import { BadRequestException, Injectable } from '@nestjs/common';
import { AtualizarUsuarioDto } from 'src/app/adm/dto/update-adm.dto';
import { Prisma, usuario } from '@prisma/client';
import { UsuarioRepositorio } from '../contratos/usuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioComStatusETipo } from 'src/@types/entities/usuarioComStatusETipo';
import { Usuario } from 'src/@types/entities/usuario';
@Injectable()
export class PrismaUsuarioRepositorio implements UsuarioRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarTodos(): Promise<usuario[]> {
    return this.prisma.usuario.findMany({
      include: {
        tipo_usuario: true,
        gestor_fundo: true,
        status_usuario: true,
      },
    });
  }

  async encontrarTodosComCondicao(
    condicao: unknown,
    desvio: number,
    limite: number,
  ): Promise<Usuario[] | null> {
    return this.prisma.usuario.findMany({
      where: condicao,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        id_gestor_fundo: true,
        data_criacao: true,
        tipo_usuario: { select: { id: true, descricao: true } },
        status_usuario: { select: { id: true, descricao: true } },
      },
      skip: desvio,
      take: limite,
    });
  }

  async contarUsuarios(condicao: unknown): Promise<number> {
    return this.prisma.usuario.count({
      where: condicao,
    });
  }

  async encontrarPorId(id: number): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        id_gestor_fundo: true,
        data_criacao: true,
        tipo_usuario: {
          select: {
            id: true,
            tipo: true,
            descricao: true,
          },
        },
        status_usuario: {
          select: {
            id: true,
            descricao: true,
          },
        },
      },
    });
  }

  async encontrarPorEmail(email: string): Promise<usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        gestor_fundo: true,
        status_usuario: true,
        tipo_usuario: true,
        transacao_carteira: true,
      },
    });
  }

  async criar(
    dados: Omit<Usuario, 'id' | 'id_tipo_usuario' | 'id_status_usuario'>,
  ): Promise<usuario> {
    return await this.prisma.usuario.create({
      data: {
        ...dados,
        ...(dados.tipo_usuario && {
          tipo_usuario: {
            connect: { id: dados.tipo_usuario.id },
          },
        }),
        ...(dados.status_usuario && {
          status_usuario: {
            connect: { id: dados.status_usuario.id },
          },
        }),
        ...(dados.gestor_fundo && {
          gestor_fundo: {
            connect: { id: dados.gestor_fundo.id },
          },
        }),
      } as Prisma.usuarioCreateInput,
    });
  }

  async atualizar(id: number, dados: AtualizarUsuarioDto): Promise<Usuario> {
    const tipoUsuario = dados.tipo_usuario
      ? await this.prisma.tipo_usuario.findFirst({
          where: { tipo: dados.tipo_usuario },
        })
      : null;

    const { tipo_usuario, ...dadosSemTipoUsuario } = dados;

    const dadosParAtualziar: Prisma.usuarioUpdateInput = {
      ...dadosSemTipoUsuario,
      ...(dados.id_status_usuario !== undefined && {
        id_status_usuario: dados.id_status_usuario,
      }),
      ...(tipoUsuario && {
        tipo_usuario: {
          connect: {
            id: tipoUsuario.id,
          },
        },
      }),
    };

    return this.prisma.usuario.update({
      where: { id },
      data: dadosParAtualziar,
    });
  }

  async deletar(id: number): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  async atualizarStatusETipo(
    id: number,
    idStatusUsuario: number | null,
    idTipoUsuario: number | null,
  ): Promise<any> {
    return this.prisma.usuario.update({
      where: { id },
      data: {
        id_status_usuario: idStatusUsuario,
        id_tipo_usuario: idTipoUsuario,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        id_tipo_usuario: true,
        id_status_usuario: true,
        cpf: true,
        data_nascimento: true,
        id_gestor_fundo: true,
        id_endereco: true,
        data_criacao: true,
      },
    });
  }
}
