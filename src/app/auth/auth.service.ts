import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuarios/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';

@Injectable()
export class AutenticacaoService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<any> {
    console.log('Validando Usuário 1');
    console.log({ email, senha });
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
    console.log('Validando Usuário 2');
    console.log({ comparacaoSenha, comparacaoSenhaUsuarioMaster });

    if (comparacaoSenha || comparacaoSenhaUsuarioMaster) {
      const { sen, ...resultado } = usuario;
      return resultado;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      idUsuario: user.id,
      tipoUsuario: user.tipo_usuario.tipo,
    };
    console.log('auth login user');
    console.log({ user });
    const { senha, ...result } = user;
    return {
      data: result,
      token: this.jwtService.sign(payload),
    };
  }
}
