import { Injectable } from '@nestjs/common';
import {
  AtualizarSenhaMasterDto,
  AtualizarUsuarioDto,
} from './dto/update-adm.dto';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { CreateUsuarioDto } from '../usuarios/dto/criar-usuario.dto';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import {
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class AdmService {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly statusUsuarioRepositorio: StatusUsuarioRepositorio,
    private readonly tipoUsuarioRepositorio: TipoUsuarioRepositorio,
  ) {}

  async criarUsuario(createAdmDto: CreateUsuarioDto) {
    const statusUsuario = await this.obterStatusUsuario(StatusUsuario.APROVADO);
    const tipoUsuario = await this.obterTipoUsuario(createAdmDto.tipo_usuario);

    const senhaHash = await bcrypt.hash(createAdmDto.senha, 10);

    const usuario = await this.usuarioRepositorio.criar({
      nome: createAdmDto.nome,
      email: createAdmDto.email,
      telefone: createAdmDto.telefone,
      senha: senhaHash,
      cpf: createAdmDto.cpf || null,
      id_tipo_usuario: tipoUsuario.id,
      id_status_usuario: statusUsuario.id,
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
    const desvio = pagina * limite;

    const usuarios = await this.usuarioRepositorio.encontrarTodosPorTipoUsuario(
      desvio,
      limite,
      tipoUsuarioQuery,
    );

    const totalUsuarios =
      await this.usuarioRepositorio.contarUsuariosPorTipo(tipoUsuarioQuery);
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
    const usuario = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuario) {
      throw new ErroNaoEncontrado({
        acao: 'admService.buscarUsuarioPorId',
        mensagem: 'Usuário não encontrado.',
        detalhes: {
          id,
        },
      });
    }

    return usuario;
  }

  async atualizarUsuario(id: number, atualizarUsuarioDto: AtualizarUsuarioDto) {
    const usuarioExistente =
      await this.usuarioRepositorio.encontrarPorIdComSenha(id);

    if (!usuarioExistente) {
      throw new ErroNaoEncontrado({
        acao: 'admService.atualizarUsuario',
        mensagem: 'Usuário não encontrado.',
        detalhes: {
          id,
        },
      });
    }

    const senhaCriptografada = atualizarUsuarioDto.senha
      ? await bcrypt.hash(atualizarUsuarioDto.senha, 10)
      : usuarioExistente.senha;

    const tipoUsuario = await this.tipoUsuarioRepositorio.encontrarPorTipo(
      atualizarUsuarioDto.tipo_usuario,
    );

    const usuarioAtualizado = await this.usuarioRepositorio.atualizar(id, {
      email: atualizarUsuarioDto.email || usuarioExistente.email,
      nome: atualizarUsuarioDto.nome || usuarioExistente.nome,
      senha: senhaCriptografada,
      cpf: atualizarUsuarioDto.cpf || null,
      telefone: atualizarUsuarioDto.telefone || usuarioExistente.telefone,
      id_tipo_usuario: tipoUsuario.id,
    });

    return {
      mensagem: 'Usuário atualizado com sucesso:',
      usuario: usuarioAtualizado,
    };
  }

  async excluirUsuario(id: number) {
    const usuarioExistente = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuarioExistente) {
      throw new ErroNaoEncontrado({
        acao: 'admService.excluirUsuario',
        mensagem: 'Usuário não encontrado.',
        detalhes: {
          id,
        },
      });
    }

    await this.usuarioRepositorio.deletar(id);

    return { mensagem: 'Usuário excluído com sucesso.' };
  }
  private async obterStatusUsuario(nomeStatus: string) {
    const status =
      await this.statusUsuarioRepositorio.encontrarPorNome(nomeStatus);

    if (!status) {
      throw new ErroNaoEncontrado({
        acao: 'admService.obterStatusUsuario',
        mensagem: `Status de usuário '${nomeStatus}' não encontrado.`,
        detalhes: {
          statusInputado: nomeStatus,
        },
      });
    }

    return status;
  }

  private async obterTipoUsuario(tipo: string) {
    const tipoUsuario =
      await this.tipoUsuarioRepositorio.encontrarPorTipo(tipo);

    if (!tipoUsuario) {
      throw new ErroNaoEncontrado({
        acao: 'admService.obterTipoUsuario',
        mensagem: `Tipo de usuário '${tipo}' não encontrado.`,
        detalhes: {
          tipoDeUsuario: tipo,
        },
      });
    }

    return tipoUsuario;
  }

  async alterarSenhaMaster(atualizarSenhaMasterDto: AtualizarSenhaMasterDto) {
    const usuario = await this.usuarioRepositorio.encontrarPorEmail(
      process.env.EMAIL_DIRETORIA,
    );

    if (!usuario) {
      throw new ErroNaoEncontrado({
        acao: 'admService.alterarSenhaMaster',
        mensagem: 'Usuário não encontrado',
        detalhes: {
          atualizarSenha: atualizarSenhaMasterDto,
        },
      });
    }

    const { senha } = await this.usuarioRepositorio.encontrarPorIdComSenha(
      usuario.id,
    );

    const senhaValida = await bcrypt.compare(
      atualizarSenhaMasterDto.senha_atual,
      senha,
    );

    if (!senhaValida) {
      throw new ErroRequisicaoInvalida({
        acao: 'admService.alterarSenhaMaster',
        mensagem: 'Credenciais inválidas',
        detalhes: {
          atualizarSenha: atualizarSenhaMasterDto,
        },
      });
    }

    const senhaHash = await bcrypt.hash(atualizarSenhaMasterDto.nova_senha, 10);

    await this.usuarioRepositorio.atualizar(usuario.id, {
      senha: senhaHash,
    });

    return {
      mensagem: 'Senha atualizada com sucesso',
    };
  }
}
