import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import { PrismaClient } from '@prisma/client';
import { ErroNaoAutorizado } from 'src/helpers/erroAplicacao';

@Injectable()
export class JwtStrategyPremium extends PassportStrategy(Strategy, 'premium') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const prisma = new PrismaClient();
    const user = await prisma.usuario.findFirst({
      where: {
        id: payload.idUsuario,
      },
      include: {
        tipo_usuario: true,
      },
    });
    if (
      user.tipo_usuario.tipo !== TipoUsuarioEnum.INVESTIDOR_PREMIUM &&
      user.tipo_usuario.tipo !== TipoUsuarioEnum.BACKOFFICE &&
      user.tipo_usuario.tipo !== TipoUsuarioEnum.ADMINISTRADOR_SISTEMAS
    ) {
      throw new ErroNaoAutorizado({
        acao: 'jwtStrategyPremium.validate',
        mensagem: 'Você não tem acesso a essa rota',
      });
    }

    return { idUsuario: payload.idUsuario, email: payload.email };
  }
}
