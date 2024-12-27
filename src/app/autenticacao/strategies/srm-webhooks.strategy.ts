import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class StrategySrmWebhooks extends PassportStrategy(
  Strategy,
  'srmWebhooks',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secretSrmWebhooks,
    });
  }

  async validate(): Promise<any> {
    return true;
  }
}
