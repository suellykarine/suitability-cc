import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AutenticarLaqusDto } from '../dto/autenticarLaqus.dto';

@Injectable()
export class AutenticarLaqusService {
  private token: string = null;
  private tokenExpiration: Date = null;

  async autenticar(AutenticarLaqus: AutenticarLaqusDto) {
    if (this.isTokenValid()) {
      return { accessToken: this.token };
    }

    const response = await fetch(`${process.env.LAQUS_AUTH_BASE_URL}auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(AutenticarLaqus),
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: error.message || 'Credenciais inválidas',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        'Falha na autenticação',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();
    this.token = data.accessToken;
    this.tokenExpiration = new Date(data.expiresAt);

    return { accessToken: this.token };
  }

  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }

    const now = new Date();
    return this.tokenExpiration.getTime() > now.getTime() + 5 * 60 * 1000;
  }
}
