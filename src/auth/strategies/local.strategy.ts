import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ServiçoDeAutenticacao } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private serviçoDeAutenticacao: ServiçoDeAutenticacao) {
    super({ usernameField: 'email', passwordField: 'senha' });
  }

  async validate(email: string, senha: string): Promise<any> {
    const usuario = await this.serviçoDeAutenticacao.validarUsuario(
      email,
      senha,
    );
    if (!usuario) {
      throw new UnauthorizedException({
        mensagem: 'Credenciais inválidas',
      });
    }
    return usuario;
  }
}
