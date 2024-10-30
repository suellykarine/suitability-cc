import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      tipo_usuario: tipoUsuario,
      status_usuario: statusUsuario,
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
    const condicao = tipoUsuarioQuery
      ? { tipo_usuario: { tipo: tipoUsuarioQuery } }
      : {};

    const usuarios = await this.usuarioRepositorio.encontrarTodosComCondicao(
      condicao,
      desvio,
      limite,
    );

    const totalUsuarios =
      await this.usuarioRepositorio.contarUsuarios(condicao);
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
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  async atualizarUsuario(id: number, atualizarUsuarioDto: AtualizarUsuarioDto) {
    const usuarioExistente = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuarioExistente) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const senhaCriptografada = atualizarUsuarioDto.senha
      ? await bcrypt.hash(atualizarUsuarioDto.senha, 10)
      : usuarioExistente.senha;

    const usuarioAtualizado = await this.usuarioRepositorio.atualizar(id, {
      email: atualizarUsuarioDto.email || usuarioExistente.email,
      nome: atualizarUsuarioDto.nome || usuarioExistente.nome,
      senha: senhaCriptografada,
      cpf: atualizarUsuarioDto.cpf || null,
      telefone: atualizarUsuarioDto.telefone || usuarioExistente.telefone,
      tipo_usuario: atualizarUsuarioDto.tipo_usuario,
    });

    return {
      mensagem: 'Usuário atualizado com sucesso:',
      usuario: usuarioAtualizado,
    };
  }

  async excluirUsuario(id: number) {
    const usuarioExistente = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuarioExistente) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usuarioRepositorio.deletar(id);

    return { mensagem: 'Usuário excluído com sucesso.' };
  }
  private async obterStatusUsuario(nomeStatus: string) {
    const status =
      await this.statusUsuarioRepositorio.encontrarPorNome(nomeStatus);

    if (!status) {
      throw new NotFoundException(
        `Status de usuário '${nomeStatus}' não encontrado.`,
      );
    }

    return status;
  }

  private async obterTipoUsuario(tipo: string) {
    const tipoUsuario =
      await this.tipoUsuarioRepositorio.encontrarPorTipo(tipo);

    if (!tipoUsuario) {
      throw new NotFoundException(`Tipo de usuário '${tipo}' não encontrado.`);
    }

    return tipoUsuario;
  }

  async alterarSenhaMaster(atualizarSenhaMasterDto: AtualizarSenhaMasterDto) {
    const usuario = await this.usuarioRepositorio.encontrarPorEmail(
      process.env.EMAIL_DIRETORIA,
    );

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

    await this.usuarioRepositorio.atualizar(usuario.id, {
      senha: senhaHash,
    });

    return {
      mensagem: 'Senha atualizada com sucesso',
    };
  }
}
