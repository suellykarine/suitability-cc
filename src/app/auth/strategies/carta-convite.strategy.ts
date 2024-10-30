import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategyCartaConvite extends PassportStrategy(
  Strategy,
  'cartaConvite',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    if (!payload) {
      return null;
    }
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: payload.idUsuario,
      },
      include: {
        tipo_usuario: true,
      },
    });

    if (!usuario || usuario.tipo_usuario.tipo !== TipoUsuarioEnum.BACKOFFICE) {
      throw new UnauthorizedException({
        mensagem: 'Você não tem acesso a essa rota',
      });
    }

    return { idUsuario: payload.idUsuario, email: payload.email };
  }
}
