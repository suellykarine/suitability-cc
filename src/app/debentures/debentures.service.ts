import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Debenture } from 'src/@types/entities/debenture';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { CriarDebentureDto } from './dto/criar-debenture.dto';

@Injectable()
export class DebentureService {
  constructor(private readonly debentureRepositorio: DebentureRepositorio) {}

  async criarDebenture(data: CriarDebentureDto): Promise<Debenture> {
    const debenturePorNome = await this.debentureRepositorio.buscarPorNome(
      data.nome_debenture,
    );
    if (debenturePorNome) {
      throw new BadRequestException(
        'Uma debenture com esse nome já foi registrada',
      );
    }

    const debenturePorNumero = await this.debentureRepositorio.buscarPorNumero(
      data.numero_debenture,
    );
    if (debenturePorNumero) {
      throw new BadRequestException(
        'Uma debenture com esse número já foi registrada',
      );
    }

    const novaDebenture = await this.debentureRepositorio.criarDebenture(data);

    return novaDebenture;
  }

  async listarDebentures(): Promise<Debenture[]> {
    const debentures = await this.debentureRepositorio.listarDebentures();
    if (!debentures) {
      throw new NotFoundException('Nenhuma debênture encontrada.');
    }
    return debentures;
  }
}
