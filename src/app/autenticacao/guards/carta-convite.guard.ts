import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuardCartaConvite extends AuthGuard('cartaConvite') {
  handleRequest(err, user) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
