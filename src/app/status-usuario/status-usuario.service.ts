import { Injectable } from '@nestjs/common';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import { AtualizarStatusUsuarioDto } from './dto/atualizar-status.dto';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import {
  ErroNaoProcessavel,
  ErroRequisicaoInvalida,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class StatusUsuarioService {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly tipoUsuarioRepositorio: TipoUsuarioRepositorio,
    private readonly statusUsuarioRepositorio: StatusUsuarioRepositorio,
  ) {}

  async atualizarStatusUsuario(
    idUsuario: number,
    atualizarStatusUsuarioDto: AtualizarStatusUsuarioDto,
  ) {
    const logAcao = 'statusUsuarioService.atualizarStatusUsuario';
    const usuario = await this.usuarioRepositorio.encontrarPorId(idUsuario);

    if (!usuario) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Usuário não encontrado',
        detalhes: {
          idUsuario,
          atualizarStatusUsuarioDto,
        },
      });
    }

    if (
      usuario.status_usuario!.nome === StatusUsuario.APROVADO ||
      usuario.status_usuario!.nome === StatusUsuario.RECUSADO ||
      usuario.status_usuario!.nome === StatusUsuario.PRIMEIRO_ACESSO_PREMIUM
    ) {
      throw new ErroNaoProcessavel({
        acao: logAcao,
        mensagem: 'Este usuário já foi analisado',
        detalhes: {
          idUsuario,
          atualizarStatusUsuarioDto,
        },
      });
    }
    let idTipoUsuario: number | null = null;
    let idStatusUsuario: number | null = null;
    const statusUpperCase = atualizarStatusUsuarioDto.status.toUpperCase();

    if (statusUpperCase === StatusUsuario.APROVADO) {
      const tipoUsuario = await this.tipoUsuarioRepositorio.encontrarPorTipo(
        TipoUsuarioEnum.INVESTIDOR_PREMIUM,
      );
      idTipoUsuario = tipoUsuario?.id || null;
    } else if (statusUpperCase === StatusUsuario.RECUSADO) {
      const tipoUsuario = await this.tipoUsuarioRepositorio.encontrarPorTipo(
        TipoUsuarioEnum.INVESTIDOR_TRIAL,
      );
      idTipoUsuario = tipoUsuario?.id || null;
    }

    const statusUsuario =
      await this.statusUsuarioRepositorio.encontrarPorNome(statusUpperCase);
    idStatusUsuario = statusUsuario?.id || null;

    if (!idStatusUsuario) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Status não encontrado',
        detalhes: {
          idUsuario,
          atualizarStatusUsuarioDto,
        },
      });
    }

    const usuarioAtualizado =
      await this.usuarioRepositorio.atualizarStatusETipo(
        idUsuario,
        idStatusUsuario,
        idTipoUsuario,
      );

    return usuarioAtualizado;
  }
}
