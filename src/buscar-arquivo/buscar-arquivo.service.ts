import { HttpException, Injectable } from '@nestjs/common';
import { BuscarConteudoArquivoDto } from './dto/buscar-arquivo.dto';

@Injectable()
export class BuscarArquivoService {
  async buscarConteudoArquivo(dto: BuscarConteudoArquivoDto): Promise<any> {
    const { arquivo_id } = dto;

    const response = await fetch(
      'https://comum-arquivo-homologacao.interno.srmasset.com/comumArquivo/buscarConteudoArquivoPorId',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arquivo_id }),
      },
    );

    if (!response.ok) {
      const errorText = await response.statusText;
      throw new HttpException(
        `Erro ao buscar conteúdo do arquivo. Código de status: ${response.status}, Erro: ${errorText}`,
        response.status,
      );
    }

    const responseData = await response.json();
    return responseData;
  }
}
