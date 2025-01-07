import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { PrismaClient } from '@prisma/client';
import { ErroNaoAutorizado } from 'src/helpers/erroAplicacao';

@Injectable()
export class JwtStrategyPreRegister extends PassportStrategy(
  Strategy,
  'pre-register',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.sercretPreRegister,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const prisma = new PrismaClient();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const encontrarTokenUsado = await prisma.token_usado.findFirst({
      where: {
        token,
      },
    });

    if (encontrarTokenUsado) {
      throw new ErroNaoAutorizado({
        acao: 'jwtStrategyPreRegister.validate',
        mensagem: 'Não autorizado',
      });
    }

    return {
      id: payload.id,
      iat: payload.iat,
    };
  }
}
