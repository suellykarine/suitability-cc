import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AutenticacaoService } from '../autenticacao.service';
import { ErroNaoAutorizado } from 'src/helpers/erroAplicacao';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private autenticacaoService: AutenticacaoService) {
    super({ usernameField: 'email', passwordField: 'senha' });
  }

  async validate(email: string, senha: string): Promise<any> {
    const usuario = await this.autenticacaoService.validarUsuario(email, senha);
    if (!usuario) {
      throw new ErroNaoAutorizado({
        acao: 'localStrategy.validate',
        mensagem: 'credênciais inválidas',
      });
    }
    return usuario;
  }
}
