import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { jwtConstants } from './constants';
import { Usuario } from 'src/@types/entities/usuario';
import { JwtPayload } from 'src/@types/entities/jwt';
import { fazerNada } from 'src/utils/funcoes/geral';

@Injectable()
export class AutenticacaoService {
  constructor(
    private jwtService: JwtService,
    private usuarioRepositorio: UsuarioRepositorio,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepositorio.encontrarPorEmail(email);

    if (!usuario) {
      return null;
    }
    if (usuario.status_usuario.nome === StatusUsuario.DESATIVADO) {
      throw new UnauthorizedException({
        mensagem: 'Usuário Inativo',
      });
    }

    const usuarioMaster = await this.usuarioRepositorio.encontrarPorEmail(
      process.env.EMAIL_DIRETORIA,
    );

    const usuarioMasterComSenha =
      await this.usuarioRepositorio.encontrarPorIdComSenha(usuarioMaster.id);

    const senhaMasterValida = usuarioMasterComSenha
      ? await bcrypt.compare(senha, usuarioMasterComSenha.senha)
      : false;

    if (senhaMasterValida) {
      return usuario;
    }

    const usuarioComSenha =
      await this.usuarioRepositorio.encontrarPorIdComSenha(usuario.id);

    const senhaUsuarioValida = await bcrypt.compare(
      senha,
      usuarioComSenha.senha,
    );

    if (!senhaUsuarioValida) return null;

    return usuario;
  }

  async login(user: Usuario) {
    const payload = {
      email: user.email,
      idUsuario: user.id,
      tipoUsuario: user.tipo_usuario.tipo,
    };

    const { token, tokenRenovacao } = await this.gerarTokens(payload);

    return {
      data: user,
      tokenRenovacao,
      token,
    };
  }

  async logout(idUsuario: number) {
    await this.usuarioRepositorio.logout(idUsuario);

    return;
  }

  async renovarToken(tokenRenovacao: string) {
    const payload = this.verificarTokenRenovacao(tokenRenovacao);
    const usuario = await this.usuarioRepositorio.encontrarPorId(
      payload.idUsuario,
    );
    if (!usuario) {
      throw new UnauthorizedException({
        mensagem: 'Usuário não encontrado',
      });
    }
    const atualTokenRenovacao =
      await this.usuarioRepositorio.buscarTokenRenovacao(payload.idUsuario);

    if (atualTokenRenovacao !== tokenRenovacao) {
      throw new UnauthorizedException(
        'Token de renovação inválido ou expirado',
      );
    }

    const tokens = await this.gerarTokens(payload);

    return { data: usuario, ...tokens };
  }

  private async gerarTokens({ exp, iat, ...payload }: JwtPayload) {
    fazerNada([exp, iat]);
    const token = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '30s',
    });

    const tokenRenovacao = this.jwtService.sign(payload, {
      secret: jwtConstants.secretTokenAtualizacao,
      expiresIn: '7d',
    });

    await this.usuarioRepositorio.adicionarTokenUsuario(
      tokenRenovacao,
      payload.idUsuario,
    );

    return { token, tokenRenovacao };
  }

  private verificarTokenRenovacao(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtConstants.secretTokenAtualizacao,
      });
      return payload;
    } catch {
      throw new UnauthorizedException({
        mensagem: 'Token expirado ou inválido',
      });
    }
  }
}
