import { BadRequestException, Injectable } from '@nestjs/common';
import { AtualizarUsuarioDto } from 'src/app/adm/dto/update-adm.dto';
import { Prisma, usuario } from '@prisma/client';
import { UsuarioRepositorio } from '../contratos/usuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
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

  async encontrarPorId(id: number): Promise<usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        tipo_usuario: true,
        status_usuario: true,
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

  async criar(data: any): Promise<usuario> {
    return await this.prisma.usuario.create({
      data,
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

    const dataParaAtualizar: any = {
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
    };

    if (data.id_status_usuario) {
      dataParaAtualizar.id_status_usuario = data.id_status_usuario;
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dataParaAtualizar,
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
