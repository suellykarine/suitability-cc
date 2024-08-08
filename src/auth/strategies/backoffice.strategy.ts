import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtStrategyBackoffice extends PassportStrategy(
  Strategy,
  'backoffice',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const prisma = new PrismaClient();
    const usuario = await prisma.usuario.findFirst({
      where: {
        id: payload.idUsuario,
      },
      include: {
        tipo_usuario: true,
      },
    });
    if (usuario.tipo_usuario.tipo !== TipoUsuario.BACKOFFICE) {
      throw new UnauthorizedException({
        mensagem: 'Você não tem acesso a essa rota',
      });
    }

    return { idUsuario: payload.idUser, email: payload.email };
  }
}
