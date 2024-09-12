import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class CcbService {
  private readonly urlBase: string;

  constructor(private configService: ConfigService) {
    this.urlBase = this.configService.get<string>('CCB_BASE_URL');
  }

  async obterAssinaturaDigital(codigoOperacao: string) {
    const endpoint = `/operacoes/${codigoOperacao}/assinatura-digital`;
    const url = `${this.urlBase}${endpoint}?modo=OPERACAO&codigosDocumento=20,21,33,35,39,46,50,54`;

    const resultado = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
    });

    if (!resultado.ok) {
      throw new HttpException('Erro ao buscar dados', 502);
    }

    const buffer = await resultado.arrayBuffer();

    const contentType =
      resultado.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition =
      resultado.headers.get('Content-Disposition') || 'attachment';

    return {
      buffer,
      contentType,
      contentDisposition,
    };
  }
}
