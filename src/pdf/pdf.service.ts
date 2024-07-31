import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class PdfService {
  async findOne(id: number) {
    const options = {
      headers: sigmaHeaders,
    };
    const urlSigmaToGetTotalItems = `${process.env.PDF_URL}${id}`;
    const sigmaFetch = await fetch(urlSigmaToGetTotalItems, options);

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
