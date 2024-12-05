import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioFundoInvestimentoRepositorio } from '../contratos/usuarioFundoInvestimentoRepositorio';
import { UsuarioFundoInvestimento } from 'src/@types/entities/usuario';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { Prisma } from '@prisma/client';
@Injectable()
export class PrismaUsuarioFundoInvestimentoRepositorio
  implements UsuarioFundoInvestimentoRepositorio
{
  constructor(private prisma: PrismaService) {}
  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarPeloIdGestorFundo(
    id: number,
  ): Promise<UsuarioFundoInvestimento> {
    const usuarioFundo = await this.prisma.usuario_fundo_investimento.findFirst(
      { where: { id_fundo_investimento_gestor_fundo: id } },
    );
    return usuarioFundo;
  }

  async encontrarPorIdUsuarioComRelacionamento(
    id: number,
  ): Promise<UsuarioFundoInvestimento[] | null> {
    const usuarioFundoInvestimento =
      await this.prisma.usuario_fundo_investimento.findMany({
        where: {
          id_usuario: id,
        },
        include: {
          fundo_investimento_gestor_fundo: {
            include: {
              fundo_investimento: {
                include: {
                  status_fundo_investimento: true,
                  procurador_fundo_fundo_investimento: {
                    include: {
                      procurador_fundo: {
                        include: {
                          endereco: true,
                        },
                      },
                    },
                  },
                  conta_repasse: true,
                  documento: {
                    include: {
                      status_documento: true,
                    },
                  },
                  fundo_backoffice: true,
                  representante_fundo: true,
                  administrador_fundo: {
                    include: {
                      administrador_fundo_representante_fundo: {
                        include: {
                          administrador_fundo: true,
                          representante_fundo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    return converterCamposDecimais(usuarioFundoInvestimento);
  }

  async criar(
    data: Omit<UsuarioFundoInvestimento, 'id'>,
  ): Promise<UsuarioFundoInvestimento> {
    const usuarioFundoInvestimento =
      await this.prisma.usuario_fundo_investimento.create({
        data: {
          id_fundo_investimento_gestor_fundo:
            data.id_fundo_investimento_gestor_fundo,
          id_usuario: data.id_usuario,
          acesso_permitido: data.acesso_permitido,
        },
      });

    return usuarioFundoInvestimento;
  }

  async removerPorFundoGestor(idFundoGestor: number) {
    await this.prisma.usuario_fundo_investimento.deleteMany({
      where: { id_fundo_investimento_gestor_fundo: idFundoGestor },
    });
  }

  async encontrarPorUsuarioEFundoGestor(
    idUsuario: number,
    idFundoGestor: number,
  ): Promise<UsuarioFundoInvestimento | null> {
    return this.prisma.usuario_fundo_investimento.findFirst({
      where: {
        id_usuario: idUsuario,
        id_fundo_investimento_gestor_fundo: idFundoGestor,
      },
    });
  }

  async buscarPorGestorFundo(
    idGestorFundo: number,
  ): Promise<UsuarioFundoInvestimento | null> {
    return this.prisma.usuario_fundo_investimento.findFirst({
      where: { id_fundo_investimento_gestor_fundo: idGestorFundo },
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.usuario_fundo_investimento.delete({ where: { id } });
  }
}
