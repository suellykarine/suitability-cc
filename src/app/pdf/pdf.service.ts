import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { sigmaHeaders } from '../autenticacao/constants';

@Injectable()
export class PdfService {
  async encontrarPdf(id: number) {
    const options = {
      headers: sigmaHeaders,
    };
    const urlSigmaParaObterItens = `${process.env.PDF_URL}${id}`;
    const sigmaFetch = await fetch(urlSigmaParaObterItens, options);

    if (sigmaFetch.ok) {
      const responseText = await sigmaFetch.text();
      return { base64: responseText };
    } else {
      throw new HttpException(
        {
          status: sigmaFetch.status,
          error: 'Erro ao buscar dados',
        },
        sigmaFetch.status as HttpStatus,
      );
    }
  }
}
