import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacaoService } from '../autenticacao.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private autenticacaoService: AutenticacaoService) {
    super({ usernameField: 'email', passwordField: 'senha' });
  }

  async validate(email: string, senha: string): Promise<any> {
    const usuario = await this.autenticacaoService.validarUsuario(email, senha);
    if (!usuario) {
      throw new UnauthorizedException({
        mensagem: 'Credenciais inválidas',
      });
    }
    return usuario;
  }
}
