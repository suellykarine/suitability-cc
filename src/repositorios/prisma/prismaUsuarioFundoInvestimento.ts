import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioFundoInvestimentoRepositorio } from '../contratos/usuarioFundoInvestimentoRepositorio';
import { UsuarioFundoInvestimento } from 'src/@types/entities/usuario';
@Injectable()
export class PrismaUsuarioFundoInvestimentoRepositorio
  implements UsuarioFundoInvestimentoRepositorio
{
  constructor(private prisma: PrismaService) {}
  async encontrarPeloIdGestorFundo(
    id: number,
  ): Promise<UsuarioFundoInvestimento> {
    const usuarioFundo = await this.prisma.usuario_fundo_investimento.findFirst(
      { where: { id_fundo_investimento_gestor_fundo: id } },
    );
    return usuarioFundo;
  }
}
