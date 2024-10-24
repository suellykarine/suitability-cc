import { BadRequestException, Injectable } from '@nestjs/common';
import { AtualizarUsuarioDto } from 'src/app/adm/dto/update-adm.dto';
import { Prisma, usuario } from '@prisma/client';
import { UsuarioRepositorio } from '../contratos/usuarioRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioComStatusETipo } from 'src/@types/entities/usuarioComStatusETipo';
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
