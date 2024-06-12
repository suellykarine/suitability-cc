import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { PrismaClient } from '@prisma/client';

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
        id: payload.idUser,
      },
      include: {
        tipo_usuario: true,
      },
    });
    if (user.tipo_usuario.tipo !== TipoUsuario.INVESTIDOR_PREMIUM) {
      throw new UnauthorizedException({
        mensagem: 'Você não tem acesso a essa rota',
      });
    }

    return { userId: payload.idUser, username: payload.email };
  }
}
