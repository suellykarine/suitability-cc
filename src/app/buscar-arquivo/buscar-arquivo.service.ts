import { Injectable } from '@nestjs/common';
import { BuscarConteudoArquivoDto } from './dto/buscar-arquivo.dto';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';

@Injectable()
export class BuscarArquivoService {
  async buscarConteudoArquivo(dto: BuscarConteudoArquivoDto): Promise<any> {
    const { arquivo_id } = dto;

    const req = await fetch(
      'https://comum-arquivo-homologacao.interno.srmasset.com/comumArquivo/buscarConteudoArquivoPorId',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arquivo_id }),
      },
    );

    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'buscarArquivoService.buscarConteudoArquivo',
        mensagem: `Erro ao buscar conteúdo do arquivo. Código de status: ${req.status}, Erro: ${req.statusText}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          arquivo_id,
        },
      });
    }

    const responseData = await req.json();
    return responseData;
  }
}
