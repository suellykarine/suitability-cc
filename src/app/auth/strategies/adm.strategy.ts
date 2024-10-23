import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtStrategyAdm extends PassportStrategy(Strategy, 'adm') {
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
    if (usuario.tipo_usuario.tipo !== TipoUsuarioEnum.ADMINISTRADOR_SISTEMAS) {
      throw new UnauthorizedException({
        mensagem: 'Você não tem acesso a essa rota',
      });
    }

    return { idUsuario: payload.idUsuario, email: payload.email };
  }
}
