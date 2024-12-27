import { Injectable } from '@nestjs/common';
import { Debenture } from 'src/@types/entities/debenture';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { CriarDebentureDto } from './dto/criar-debenture.dto';
import {
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class DebentureService {
  constructor(private readonly debentureRepositorio: DebentureRepositorio) {}

  async criarDebenture(data: CriarDebentureDto): Promise<Debenture> {
    const debenturePorNome = await this.debentureRepositorio.buscarPorNome(
      data.nome_debenture,
    );
    if (debenturePorNome) {
      throw new ErroRequisicaoInvalida({
        acao: 'debenture.criarDebenture',
        mensagem: 'Uma debenture com esse nome já foi registrada',
        detalhes: {
          data: data,
          nomeDebenture: debenturePorNome,
        },
      });
    }

    const debenturePorNumero = await this.debentureRepositorio.buscarPorNumero(
      data.numero_debenture,
    );
    if (debenturePorNumero) {
      throw new ErroRequisicaoInvalida({
        acao: 'debenture.criarDebenture',
        mensagem: 'Uma debenture com esse número já foi registrada',
        detalhes: {
          data: data,
          nomeDebenture: debenturePorNome,
          numeroDebenture: debenturePorNumero,
        },
      });
    }

    const novaDebenture = await this.debentureRepositorio.criarDebenture(data);

    return novaDebenture;
  }

  async listarDebentures(): Promise<Debenture[]> {
    const debentures = await this.debentureRepositorio.listarDebentures();
    if (!debentures) {
      throw new ErroNaoEncontrado({
        acao: 'debenture.listarDebentures',
        mensagem: 'Nenhuma debênture encontrada.',
        detalhes: {
          debentures,
        },
      });
    }
    return debentures;
  }
}
