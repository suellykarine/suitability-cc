import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdmCreateUsuarioDto } from './dto/create-adm.dto';
import {
  AtualizarSenhaMasterDto,
  AtualizarUsuarioDto,
} from './dto/update-adm.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusUsuario } from 'src/enums/StatusUsuario';

@Injectable()
export class AdmService {
  constructor(private readonly prisma: PrismaService) {}

  async criarUsuario(createAdmDto: AdmCreateUsuarioDto) {
    const statusUsuario = await this.obterStatusUsuario(StatusUsuario.APROVADO);
    const tipoUsuario = await this.obterTipoUsuario(createAdmDto.tipo_usuario);

    const senhaHash = await bcrypt.hash(createAdmDto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: createAdmDto.nome,
        email: createAdmDto.email,
        telefone: createAdmDto.telefone,
        senha: senhaHash,
        cpf: createAdmDto.cpf || null,
        id_tipo_usuario: tipoUsuario.id,
        id_status_usuario: statusUsuario.id,
      },
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
    });

    return {
      mensagem: 'Usuário criado com sucesso',
      usuario,
    };
  }

  async buscarUsuarios(
    tipoUsuarioQuery: string,
    pagina: number,
    limite: number,
  ) {
    const offset = pagina * limite;
    const condicao = tipoUsuarioQuery
      ? { tipo_usuario: { tipo: tipoUsuarioQuery } }
      : {};

    const usuarios = await this.prisma.usuario.findMany({
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
      skip: offset,
      take: limite,
    });

    const totalUsuarios = await this.prisma.usuario.count({ where: condicao });
    const totalPaginas = Math.ceil(totalUsuarios / limite);

    return {
      paginacao: {
        pagina,
        limite,
        totalUsuarios,
        totalPaginas,
      },
      usuarios,
    };
  }

  async buscarUsuarioPorId(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
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

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  async atualizarUsuario(id: number, atualizarUsuarioDto: AtualizarUsuarioDto) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const senhaCriptografada = atualizarUsuarioDto.senha
      ? await bcrypt.hash(atualizarUsuarioDto.senha, 10)
      : usuarioExistente.senha;

    const tipoUsuario = atualizarUsuarioDto.tipo_usuario
      ? await this.prisma.tipo_usuario.findUnique({
          where: { tipo: atualizarUsuarioDto.tipo_usuario },
        })
      : undefined;

    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        email: atualizarUsuarioDto.email || usuarioExistente.email,
        nome: atualizarUsuarioDto.nome || usuarioExistente.nome,
        senha: senhaCriptografada,
        cpf: atualizarUsuarioDto.cpf || null,
        telefone: atualizarUsuarioDto.telefone || usuarioExistente.telefone,
        id_tipo_usuario: tipoUsuario?.id || usuarioExistente.id_tipo_usuario,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        id_gestor_fundo: true,
        data_criacao: true,
        tipo_usuario: {
          select: {
            id: true,
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

    return {
      mensagem: 'Usuário atualizado com sucesso:',
      usuario: usuarioAtualizado,
    };
  }

  async excluirUsuario(id: number) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { mensagem: 'Usuário excluído com sucesso.' };
  }
  private async obterStatusUsuario(nomeStatus: string) {
    const status = await this.prisma.status_usuario.findFirst({
      where: { nome: nomeStatus },
    });

    if (!status) {
      throw new NotFoundException(
        `Status de usuário '${nomeStatus}' não encontrado.`,
      );
    }

    return status;
  }

  private async obterTipoUsuario(tipo: string) {
    const tipoUsuario = await this.prisma.tipo_usuario.findUnique({
      where: { tipo },
    });

    if (!tipoUsuario) {
      throw new NotFoundException(`Tipo de usuário '${tipo}' não encontrado.`);
    }

    return tipoUsuario;
  }

  async alterarSenhaMaster(atualizarSenhaMasterDto: AtualizarSenhaMasterDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: process.env.EMAIL_DIRETORIA },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(
      atualizarSenhaMasterDto.senha_atual,
      usuario.senha,
    );

    if (!senhaValida) {
      throw new BadRequestException('Credenciais inválidas');
    }

    const senhaHash = await bcrypt.hash(atualizarSenhaMasterDto.nova_senha, 10);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash },
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

    return {
      mensagem: 'Senha atualizada com sucesso',
    };
  }
}
