import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Endereco } from 'src/@types/entities/endereco';
import { EnderecoRepositorio } from '../contratos/enderecoRepositorio';
import { omitir } from 'src/utils/funcoes/omitir';

@Injectable()
export class PrismaEnderecoRepositorio implements EnderecoRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async atualizar(
    id: number,
    dadosAtualizados: Partial<Omit<Endereco, 'id'>>,
  ): Promise<Endereco | null> {
    const dados = omitir(dadosAtualizados, [
      'gestor_fundo',
      'procurador_fundo',
      'administrador_fundo',
      'representante_fundo',
      'usuario',
    ]);

    return await this.prisma.endereco.update({
      where: { id },
      data: { ...dados },
    });
  }

  async buscarPorId(id: number): Promise<Endereco | null> {
    return await this.prisma.endereco.findUnique({
      where: { id },
    });
  }
}
