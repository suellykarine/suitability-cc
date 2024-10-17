import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuardPreRegistro extends AuthGuard('pre-register') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err;
    }

    const request = context.switchToHttp().getRequest();
    request.cartaConvite = user;

    return user;
  }
}
