import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from 'src/app/autenticacao/constants';

@Injectable()
export class AuthorizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const segTimeBeforeExpiration =
      process.env.SEG_TIME_BEFORE_EXPIRATION || 300;

    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, jwtConstants.secret) as any;

        if (decoded && decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeToExpiration = decoded.exp - currentTime;

          if (timeToExpiration < Number(segTimeBeforeExpiration)) {
            const newToken = jwt.sign(
              {
                email: decoded.email,
                idUser: decoded.idUser,
                typeUser: decoded.typeUser,
              },
              jwtConstants.secret,
              { expiresIn: '15m' },
            );
            response.setHeader('Authorization', `Bearer ${newToken}`);
          }
        }
      } catch {}
    }

    return next.handle();
  }
}
