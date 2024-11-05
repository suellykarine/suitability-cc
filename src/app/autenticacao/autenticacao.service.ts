import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario, UsuarioService } from '../usuarios/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { jwtConstants } from './constants';

@Injectable()
export class AutenticacaoService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private usuarioRepositorio: UsuarioRepositorio,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<any> {
    const usuario = await this.usuarioService.encontrarUsuario(email);

    if (!usuario) {
      return null;
    }
    if (usuario.status_usuario.nome === StatusUsuario.DESATIVADO) {
      throw new UnauthorizedException({
        mensagem: 'Usuário Inativo',
      });
    }

    const comparacaoSenha = await bcrypt.compare(senha, usuario.senha);

    const usuarioMaster = await this.usuarioService.encontrarUsuario(
      process.env.EMAIL_DIRETORIA,
    );

    let comparacaoSenhaUsuarioMaster;

    if (usuarioMaster) {
      comparacaoSenhaUsuarioMaster = await bcrypt.compare(
        senha,
        usuarioMaster.senha,
      );
    }

    if (comparacaoSenha || comparacaoSenhaUsuarioMaster) {
      const { sen, ...resultado } = usuario;
      return resultado;
    }
    return null;
  }

  async login(user: Usuario) {
    const payload = {
      email: user.email,
      idUsuario: user.id,
      tipoUsuario: user.tipo_usuario.tipo,
    };
    const { senha, ...usuarioSemSenha } = user;

    const token = this.gerarTokenAcesso(payload);

    const tokenDeAtualizacao = this.jwtService.sign(payload, {
      secret: jwtConstants.secretTokenAtualizacao,
      expiresIn: '7d',
    });

    await this.usuarioRepositorio.adicionarTokenUsuario(
      tokenDeAtualizacao,
      user.id,
    );

    usuarioSemSenha.token_renovacao = tokenDeAtualizacao;
    return {
      data: usuarioSemSenha,
      token: token,
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
    if (!usuario || usuario.token_renovacao !== tokenRenovacao) {
      throw new UnauthorizedException(
        'Token de renovação inválido ou expirado',
      );
    }

    const novoTokenAcesso = await this.gerarTokenAcesso({
      idUsuario: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.id_tipo_usuario,
    });

    return { tokenAcesso: novoTokenAcesso };
  }

  private gerarTokenAcesso(payload: any) {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '15m',
    });
  }

  private verificarTokenRenovacao(token: string) {
    try {
      const tokenVerificado = this.jwtService.verify(token, {
        secret: jwtConstants.secretTokenAtualizacao,
      });
      return tokenVerificado;
    } catch {
      throw new UnauthorizedException({
        mensagem: 'Token expirado ou inválido',
      });
    }
  }
}
