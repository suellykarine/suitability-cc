import { AutenticarLaqusDto } from '../dto/autenticarLaqus.dto';
import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class AutenticarLaqusService {
  private token: string = null;
  private tokenExpiration: Date = null;

  async autenticar(AutenticarLaqus: AutenticarLaqusDto) {
    if (this.isTokenValid()) {
      return { accessToken: this.token };
    }
    try {
      const response = await fetch(`${process.env.LAQUS_AUTH_BASE_URL}auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(AutenticarLaqus),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const naoAutorizado = response.status === 401;
          if (naoAutorizado)
            throw new UnauthorizedException('Credenciais Inválidas');
        }
        throw new InternalServerErrorException('Falha na autenticação');
      }

      const data = await response.json();
      this.token = data.accessToken;
      this.tokenExpiration = new Date(data.expiresAt);

      return { accessToken: this.token };
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Erro ao cadastrar o investidor';
      throw new HttpException(message, status);
    }
  }

  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }

    const now = new Date();
    return this.tokenExpiration.getTime() > now.getTime() + 5 * 60 * 1000;
  }
}
