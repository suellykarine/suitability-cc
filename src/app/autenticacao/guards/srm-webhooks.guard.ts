import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { tokens } from '../constants';

@Injectable()
export class SrmWebhooksAuthGuard implements CanActivate {
  private readonly tokenValido = tokens.secretSrmWebhooks;
  canActivate(context: ExecutionContext): boolean {
    const requisicao = context.switchToHttp().getRequest<Request>();
    const cabecalhoAutorizacao = requisicao.headers['authorization'];

    if (!cabecalhoAutorizacao) {
      throw new UnauthorizedException('Autenticação não encontrada');
    }

    const token = cabecalhoAutorizacao.split(' ')[1];
    if (token !== this.tokenValido) {
      throw new UnauthorizedException('Autenticação inválida');
    }

    return true;
  }
}
