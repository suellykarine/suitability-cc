import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ProcuradorFundo } from 'src/@types/entities/fundos';
import { ProcuradorFundoRepositorio } from 'src/repositorios/contratos/procuradorFundoRepositorio';

@Injectable()
export class PrismaProcuradorFundoRepositorio
  implements ProcuradorFundoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async atualizar(
    id: number,
    dadosAtualizados: Partial<Omit<ProcuradorFundo, 'id'>>,
  ): Promise<ProcuradorFundo | null> {
    const {
      id_endereco,
      procurador_fundo_fundo_investimento,
      ...restoDosDados
    } = dadosAtualizados;

    return await this.prisma.procurador_fundo.update({
      where: { id },
      data: {
        ...restoDosDados,
        endereco: id_endereco
          ? {
              connect: { id: id_endereco },
            }
          : undefined,
        procurador_fundo_fundo_investimento: procurador_fundo_fundo_investimento
          ? {
              set: procurador_fundo_fundo_investimento.map((item) => ({
                id: item.id,
              })),
            }
          : undefined,
      },
    });
  }

  async buscarProcuradorPorCpf(cpf: string): Promise<ProcuradorFundo | null> {
    return await this.prisma.procurador_fundo.findUnique({
      where: { cpf },
      include: {
        endereco: true,
      },
    });
  }
}
