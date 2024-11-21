import { Injectable } from '@nestjs/common';
import { Prisma, usuario as PrismaUsuario } from '@prisma/client';
import { UsuarioRepositorio } from '../contratos/usuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import {
  Usuario,
  UsuarioComSenha,
  UsuarioSemVinculos,
  UsuarioSemVinculosComSenha,
} from 'src/@types/entities/usuario';
import { fazerNada } from 'src/utils/funcoes/geral';
@Injectable()
export class PrismaUsuarioRepositorio implements UsuarioRepositorio {
  constructor(private prisma: PrismaService) {}

  private removerTokenRenovacaoDeUsuarios(
    usuario: Omit<PrismaUsuario, 'senha'>[],
  ): Usuario[] {
    const usuariosSemToken = usuario?.map((usuario) => {
      const { token_renovacao, ...restoUsuario } = usuario;
      fazerNada(token_renovacao);
      return restoUsuario;
    });

    return usuariosSemToken;
  }
  private removerTokenRenovacaoDeUsuario(
    usuario: Omit<PrismaUsuario, 'senha'>,
  ): Usuario {
    const { token_renovacao, ...restoUsuario } = usuario;
    fazerNada(token_renovacao);
    return restoUsuario;
  }

  private removerTokenRenovacaoDeUsuarioComSenha(
    usuario: PrismaUsuario,
  ): UsuarioComSenha {
    const { token_renovacao, ...restoUsuario } = usuario;
    fazerNada(token_renovacao);
    return restoUsuario;
  }
  private removerSenhaDePrismaUsuario(
    usuario: PrismaUsuario,
  ): Omit<PrismaUsuario, 'senha'> {
    const { senha, ...restoUsuario } = usuario;
    fazerNada(senha);
    return restoUsuario;
  }

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarTodos(): Promise<Usuario[]> {
    const usuariosEncontrados = await this.prisma.usuario.findMany({
      include: {
        tipo_usuario: true,
        gestor_fundo: true,
        status_usuario: true,
      },
    });

    return this.removerTokenRenovacaoDeUsuarios(usuariosEncontrados);
  }

  async encontrarTodosPorTipoUsuario(
    desvio: number,
    limite: number,
    tipoUsuario?: string,
  ): Promise<Usuario[] | null> {
    const condicao = tipoUsuario ? { tipo_usuario: { tipo: tipoUsuario } } : {};
    const usuariosEncontrados = await this.prisma.usuario.findMany({
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

    return usuariosEncontrados;
  }

  async contarUsuariosPorTipo(tipoUsuario: string): Promise<number> {
    const condicao = tipoUsuario ? { tipo_usuario: { tipo: tipoUsuario } } : {};

    return this.prisma.usuario.count({
      where: condicao,
    });
  }

  async encontrarPorId(id: number): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        gestor_fundo: true,
        status_usuario: true,
        tipo_usuario: true,
        transacao_carteira: true,
      },
    });
    const usuarioSemSenha = this.removerSenhaDePrismaUsuario(usuario);
    return this.removerTokenRenovacaoDeUsuario(usuarioSemSenha);
  }

  async encontrarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        gestor_fundo: true,
        status_usuario: true,
        tipo_usuario: true,
        transacao_carteira: true,
      },
    });
    const usuarioSemSenha = this.removerSenhaDePrismaUsuario(usuario);
    return this.removerTokenRenovacaoDeUsuario(usuarioSemSenha);
  }

  async encontrarPorIdComSenha(id: number): Promise<UsuarioComSenha | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    return this.removerTokenRenovacaoDeUsuarioComSenha(usuario);
  }

  async criar({
    id_endereco,
    id_gestor_fundo,
    id_status_usuario,
    id_tipo_usuario,
    ...dados
  }: Omit<UsuarioSemVinculosComSenha, 'id'>): Promise<Usuario> {
    const usuarioCriado = await this.prisma.usuario.create({
      data: {
        ...dados,
        ...(id_tipo_usuario && {
          tipo_usuario: { connect: { id: id_tipo_usuario } },
        }),
        ...(id_endereco && {
          endereco: { connect: { id: id_endereco } },
        }),
        ...(id_gestor_fundo && {
          gestor_fundo: { connect: { id: id_gestor_fundo } },
        }),
        ...(id_status_usuario && {
          status_usuario: { connect: { id: id_status_usuario } },
        }),
      },
    });

    const usuarioSemSenha = this.removerSenhaDePrismaUsuario(usuarioCriado);
    return this.removerTokenRenovacaoDeUsuario(usuarioSemSenha);
  }

  async atualizar(
    id: number,
    {
      id_tipo_usuario,
      id_endereco,
      id_gestor_fundo,
      id_status_usuario,
      ...dados
    }: Partial<Omit<UsuarioSemVinculos, 'id'>>,
  ): Promise<Usuario> {
    const usuarioAtualizado = await this.prisma.usuario.update({
      where: {
        id: id,
      },
      data: {
        ...dados,
        ...(id_tipo_usuario && {
          tipo_usuario: { connect: { id: id_tipo_usuario } },
        }),
        ...(id_endereco && {
          endereco: { connect: { id: id_endereco } },
        }),
        ...(id_gestor_fundo && {
          gestor_fundo: { connect: { id: id_gestor_fundo } },
        }),
        ...(id_status_usuario && {
          status_usuario: { connect: { id: id_status_usuario } },
        }),
      },
    });
    const usuarioSemSenha = this.removerSenhaDePrismaUsuario(usuarioAtualizado);
    return this.removerTokenRenovacaoDeUsuario(usuarioSemSenha);
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
  ): Promise<Usuario> {
    const usuarioAtualizado = await this.prisma.usuario.update({
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
    return usuarioAtualizado;
  }

  async adicionarTokenUsuario(
    token: string,
    idUsuario: number,
  ): Promise<{ tokenRenovacao: string }> {
    const { token_renovacao } = await this.prisma.usuario.update({
      where: {
        id: idUsuario,
      },
      data: {
        token_renovacao: token,
      },
      select: {
        token_renovacao: true,
      },
    });

    return { tokenRenovacao: token_renovacao };
  }

  async buscarTokenRenovacao(idUsuario: number): Promise<string | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: {
        token_renovacao: true,
      },
    });

    return usuario?.token_renovacao || null;
  }

  async logout(idUsuario: number): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: idUsuario },
      data: {
        token_renovacao: null,
      },
    });
  }
}
