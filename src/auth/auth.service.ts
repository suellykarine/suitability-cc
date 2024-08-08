import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ServicoUsuario } from '../usuarios/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';

@Injectable()
export class ServiçoDeAutenticacao {
  constructor(
    private servicoUsuario: ServicoUsuario,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<any> {
    const usuario = await this.servicoUsuario.encontrarUsuario(email);

    if (!usuario) {
      return null;
    }
    if (usuario.status_usuario.nome === StatusUsuario.DESATIVADO) {
      throw new UnauthorizedException({
        mensagem: 'Usuário Inativo',
      });
    }

    const comparacaoSenha = await bcrypt.compare(senha, usuario.senha);

    const usuarioMaster = await this.servicoUsuario.encontrarUsuarioMaster(
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

  async login(user: any) {
    const payload = {
      email: user.email,
      idUsuario: user.id,
      tipoUsuario: user.tipo_usuario.tipo,
    };
    const { senha, ...result } = user;
    return {
      data: result,
      token: this.jwtService.sign(payload),
    };
  }
}
