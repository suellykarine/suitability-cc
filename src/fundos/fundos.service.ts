import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  fundo_investimento_gestor_fundo,
  fundo_investimento,
  status_fundo_investimento,
  procurador_fundo,
  administrador_fundo,
} from '@prisma/client';
import {
  formatarCNPJ,
  formatarCPF,
  formatarTelefone,
} from 'src/utils/formatar';
import { StatusFundoInvestimento } from 'src/enums/StatusFundoInvestimento';
import { PerfisInvestimento } from 'src/enums/PerfisInvestimento';
import { CriarFundoDto } from './dto/criar-fundo.dto';
import { CriarFactoringDto } from './dto/criar-factoring.dto';
import { CriarSecuritizadoraDto } from './dto/criar-securitizaroda.dto copy';
import { AtualizarFundoDto } from './dto/atualizar-fundo.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FundosService {
  constructor(private prisma: PrismaService) {}

  async criarFundo(id: number, criarFundoDto: CriarFundoDto[]) {
    const usuario = await this.obterUsuario(id);
    let procurador: procurador_fundo;

    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const fundosCriados = [];
        for (const fundo of criarFundoDto) {
          await this.fundoJaExistente(prisma, fundo.cpf_cnpj);

          const fundoCriado = await this.criarNovoFundo(fundo, usuario, prisma);
          fundosCriados.push(fundoCriado.novoFundo);
          procurador = fundoCriado.procurador_fundo;
        }

        return {
          mensagem: 'Fundos criados com sucesso',
          fundos_criados: fundosCriados,
          procurador_fundo: procurador,
        };
      },
    );
  }

  async criarFactoring(id: number, criarFundoDto: CriarFactoringDto[]) {
    const usuario = await this.obterUsuario(id);

    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const factoringsCriadas = [];
        for (const fundo of criarFundoDto) {
          await this.fundoJaExistente(prisma, fundo.cpf_cnpj);

          const novaFactoring = await this.criarNovaFactoring(
            fundo,
            usuario,
            prisma,
          );
          factoringsCriadas.push(novaFactoring);
        }

        return {
          mensagem: 'Factorings criadas com sucesso',
          factorings_criadas: factoringsCriadas,
        };
      },
    );
  }

  async criarSecuritizadora(
    id: number,
    criarFundoDto: CriarSecuritizadoraDto[],
  ) {
    const usuario = await this.obterUsuario(id);

    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const securitizadorasCriadas = [];
        for (const fundo of criarFundoDto) {
          await this.fundoJaExistente(prisma, fundo.cpf_cnpj);

          const novaSecuritizadora = await this.criarNovaSecuritizadora(
            fundo,
            usuario,
            prisma,
          );
          securitizadorasCriadas.push(novaSecuritizadora);
        }

        return {
          mensagem: 'Securitizadoras criadas com sucesso',
          securitizadoras_criadas: securitizadorasCriadas,
        };
      },
    );
  }

  async buscarFundos() {
    const fundos = await this.prisma.fundo_investimento.findMany();
    return fundos.map((fundo) => {
      return {
        ...fundo,
        cnpj: formatarCNPJ(fundo.cpf_cnpj),
      };
    });
  }

  async buscarFundosDoUsuario(idUsuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const fundosDoUsuario =
      await this.prisma.usuario_fundo_investimento.findMany({
        where: { id_usuario: usuario.id },
      });

    const fundosParaRetornar: any[] = [];

    await Promise.all(
      fundosDoUsuario.map(async (ele) => {
        const fundoGestor =
          await this.prisma.fundo_investimento_gestor_fundo.findUnique({
            where: { id: ele.id_fundo_investimento_gestor_fundo! },
          });

        const fundo = await this.prisma.fundo_investimento.findUnique({
          where: {
            id: fundoGestor?.id_fundo_investimento,
          },
          include: {
            status_fundo_investimento: true,
            administrador_fundo: {
              include: {
                administrador_fundo_representante_fundo: {
                  include: { representante_fundo: true },
                },
              },
            },
            representante_fundo: true,
            fundo_backoffice: true,
            procurador_fundo_fundo_investimento: {
              include: { procurador_fundo: { include: { endereco: true } } },
            },
            conta_repasse: true,
            documento: { include: { status_documento: true } },
          },
        });

        if (fundo) {
          fundosParaRetornar.push(fundo);
        }
      }),
    );

    const fundosFormatados = fundosParaRetornar.map((fundo: any) => {
      let representanteFormatado;

      if (fundo.administrador_fundo) {
        const representantes =
          fundo.administrador_fundo.administrador_fundo_representante_fundo;
        representanteFormatado = representantes.map((ele: any) => ({
          ...ele.representante_fundo,
          cpf: ele.cpf ? formatarCPF(ele.representante_fundo.cpf) : '',
          telefone: ele.telefone
            ? formatarTelefone(ele.representante_fundo.telefone)
            : '',
        }));

        return {
          ...fundo,
          cnpj: formatarCNPJ(fundo.cpf_cnpj),
          fundo_backoffice: {
            ...fundo.fundo_backoffice,
            telefone: formatarTelefone(fundo.fundo_backoffice.telefone),
          },
          administrador_fundo: {
            ...fundo.administrador_fundo,
            cnpj: formatarCNPJ(fundo.administrador_fundo.cnpj),
            telefone: formatarTelefone(fundo.administrador_fundo.telefone),
            representante_fundo: representanteFormatado,
          },
        };
      } else {
        const representante = fundo.representante_fundo;
        representanteFormatado = {
          ...representante,
          cpf: representante.cpf ? formatarCPF(representante.cpf) : '',
          telefone: representante.telefone
            ? formatarTelefone(representante.telefone)
            : '',
        };

        return {
          ...fundo,
          cnpj: formatarCNPJ(fundo.cpf_cnpj),
          fundo_backoffice: {
            ...fundo.fundo_backoffice,
            telefone: formatarTelefone(fundo.fundo_backoffice.telefone),
          },
          representante_fundo: representanteFormatado,
        };
      }
    });

    return { fundos_de_investimento: fundosFormatados };
  }

  async patchFundo(
    id: number,
    data: AtualizarFundoDto,
    tipoEstrutura: PerfisInvestimento,
    idUsuario: number,
  ) {
    tipoEstrutura = tipoEstrutura ? tipoEstrutura : PerfisInvestimento.FUNDO;
    const fundo = await this.prisma.fundo_investimento.findUnique({
      where: { id, tipo_estrutura: tipoEstrutura },
    });

    if (!fundo) {
      throw new NotFoundException(`${tipoEstrutura} não encontrado`);
    }

    await this.verificarPropriedadeFundo(idUsuario, fundo.id);

    const statusFundo = await this.obterStatusFundoPatch(data.status);

    if (data.status && Object.keys(data).length === 1) {
      return this.atualizarStatusFundo(fundo.id, statusFundo);
    }

    const fundoAtualizado = await this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        await this.atualizarEntidadesAssociadas(fundo, data, prisma);

        return await prisma.fundo_investimento.update({
          where: { id: fundo.id },
          data: {
            nome: data.nome,
            cpf_cnpj: data.cpf_cnpj,
            nome_fantasia: data.nome_fantasia,
            razao_social: data.razao_social,
            codigo_anbima: data.codigo_anbima,
            faturamento_anual: data.faturamento_anual,
            status_fundo_investimento: { connect: { id: statusFundo.id } },
          },
          include: {
            fundo_backoffice: true,
            conta_repasse: true,
            status_fundo_investimento: true,
            administrador_fundo: true,
          },
        });
      },
    );

    return {
      mensagem: `${tipoEstrutura} atualizado`,
      fundo_atualizado: fundoAtualizado,
    };
  }

  async deleteFundo(
    id: number,
    idGestorFundo: number,
    tipoEstrutura: PerfisInvestimento,
    idUsuario: number,
  ) {
    tipoEstrutura = tipoEstrutura ? tipoEstrutura : PerfisInvestimento.FUNDO;
    if (!idGestorFundo) {
      throw new BadRequestException({
        mensagem: 'Id do gestor do fundo necessário',
      });
    }
    const fundo = await this.prisma.fundo_investimento.findUnique({
      where: { id, tipo_estrutura: tipoEstrutura },
      include: { procurador_fundo_fundo_investimento: true },
    });

    if (!fundo) {
      throw new NotFoundException(`${tipoEstrutura} não encontrado`);
    }

    await this.verificarPropriedadeFundo(idUsuario, fundo.id);

    if (fundo.tipo_estrutura === PerfisInvestimento.FUNDO) {
      await this.removerEntidadesAssociadasEFundo(fundo, idGestorFundo);
    } else {
      await this.removerEntidadesAssociadasEFactoringOuSecuritizadora(
        fundo.id,
        idGestorFundo,
        fundo.tipo_estrutura,
      );
    }

    return { mensagem: `${tipoEstrutura} removido com sucesso` };
  }

  private async criarNovoFundo(
    fundo: CriarFundoDto,
    usuario: any,
    prisma: Prisma.TransactionClient,
  ) {
    const gestorFundo = await this.obterGestorFundo(
      fundo.cnpj_gestor_fundo,
      prisma,
    );
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
      prisma,
    );
    const administradorFundoFinal = await this.obterOuCriarAdministradorFundo(
      fundo.email_administrador,
      fundo.nome_administrador,
      fundo.cnpj_administrador,
      fundo.telefone_administrador,
      prisma,
    );
    const representante = await this.obterOuCriarRepresentante(
      fundo,
      prisma,
      administradorFundoFinal,
      PerfisInvestimento.FUNDO,
    );
    const statusFundo = await this.obterStatusFundo(prisma);

    const novoFundo = await prisma.fundo_investimento.create({
      data: {
        nome: fundo.nome,
        cpf_cnpj: fundo.cpf_cnpj,
        razao_social: fundo.razao_social,
        nome_fantasia: fundo.nome_fantasia,
        codigo_anbima: fundo.codigo_anbima,
        classe_anbima: fundo.classe_anbima,
        atividade_principal: fundo.atividade_principal || '',
        detalhes: fundo.detalhes || '',
        data_criacao: new Date(),
        tipo_estrutura: PerfisInvestimento.FUNDO,
        id_administrador_fundo: administradorFundoFinal.id,
        id_fundo_backoffice: backOffice.id,
        id_representante_fundo: representante?.id,
        id_status_fundo_investimento: statusFundo?.id,
        faturamento_anual: String(fundo.faturamento_anual),
      },
      include: {
        fundo_backoffice: true,
        administrador_fundo: {
          include: {
            administrador_fundo_representante_fundo: {
              include: { representante_fundo: true },
            },
          },
        },
        status_fundo_investimento: true,
      },
    });

    const procurador = await this.cadastrarProcurador(
      novoFundo.id,
      fundo,
      prisma,
    );

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novoFundo.id, fundo, prisma);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novoFundo.id,
      gestorFundo.id,
      prisma,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
      prisma,
    );

    return {
      novoFundo: novoFundo,
      procurador_fundo: procurador,
    };
  }

  private async criarNovaFactoring(
    fundo: CriarFactoringDto,
    usuario: any,
    prisma: Prisma.TransactionClient,
  ) {
    const gestorFundo = await this.obterGestorFundo(
      fundo.cnpj_gestor_fundo,
      prisma,
    );
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
      prisma,
    );
    const representante = await this.obterOuCriarRepresentante(fundo, prisma);
    const statusFundo = await this.obterStatusFundo(prisma);

    const novaFactoring = await prisma.fundo_investimento.create({
      data: {
        nome: fundo.nome,
        cpf_cnpj: fundo.cpf_cnpj,
        razao_social: fundo.razao_social,
        nome_fantasia: fundo.nome_fantasia,
        atividade_principal: fundo.atividade_principal || '',
        detalhes: fundo.detalhes || '',
        tipo_estrutura: PerfisInvestimento.FACTORING,
        id_fundo_backoffice: backOffice.id,
        id_representante_fundo: representante?.id,
        id_status_fundo_investimento: statusFundo?.id,
        data_criacao: new Date(),
        faturamento_anual: String(fundo.faturamento_anual),
      },
      include: {
        fundo_backoffice: true,
        representante_fundo: true,
        status_fundo_investimento: true,
      },
    });

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novaFactoring.id, fundo, prisma);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novaFactoring.id,
      gestorFundo.id,
      prisma,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
      prisma,
    );

    return novaFactoring;
  }

  private async criarNovaSecuritizadora(
    fundo: CriarSecuritizadoraDto,
    usuario: any,
    prisma: Prisma.TransactionClient,
  ) {
    const gestorFundo = await this.obterGestorFundo(
      fundo.cnpj_gestor_fundo,
      prisma,
    );
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
      prisma,
    );
    const representante = await this.obterOuCriarRepresentante(fundo, prisma);
    const statusFundo = await this.obterStatusFundo(prisma);

    const novaSecuritizadora = await prisma.fundo_investimento.create({
      data: {
        nome: fundo.nome,
        cpf_cnpj: fundo.cpf_cnpj,
        razao_social: fundo.razao_social,
        nome_fantasia: fundo.nome_fantasia,
        atividade_principal: fundo.atividade_principal || '',
        detalhes: fundo.detalhes || '',
        tipo_estrutura: PerfisInvestimento.SECURITIZADORA,
        id_fundo_backoffice: backOffice.id,
        id_representante_fundo: representante?.id,
        id_status_fundo_investimento: statusFundo?.id,
        data_criacao: new Date(),
        faturamento_anual: String(fundo.faturamento_anual),
      },
      include: {
        fundo_backoffice: true,
        representante_fundo: true,
        status_fundo_investimento: true,
      },
    });

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novaSecuritizadora.id, fundo, prisma);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novaSecuritizadora.id,
      gestorFundo.id,
      prisma,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
      prisma,
    );

    return novaSecuritizadora;
  }

  private async obterUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  private async obterGestorFundo(
    cnpj: string,
    prisma: Prisma.TransactionClient,
  ) {
    const gestorFundo = await prisma.gestor_fundo.findUnique({
      where: { cnpj },
    });
    if (!gestorFundo) {
      throw new NotFoundException('Gestor não encontrado.');
    }
    return gestorFundo;
  }

  private async obterOuCriarBackOffice(
    nome: string,
    email: string,
    telefone: string,
    prisma: Prisma.TransactionClient,
  ) {
    let backOffice = await prisma.fundo_backoffice.findUnique({
      where: { email },
    });
    if (!backOffice) {
      backOffice = await prisma.fundo_backoffice.create({
        data: { nome, email, telefone },
      });
    }
    return backOffice;
  }

  private async obterOuCriarAdministradorFundo(
    email: string,
    nome: string,
    cnpj: string,
    telefone: string,
    prisma: Prisma.TransactionClient,
  ) {
    let administradorFundo = await prisma.administrador_fundo.findUnique({
      where: { email },
    });
    if (!administradorFundo) {
      administradorFundo = await prisma.administrador_fundo.create({
        data: { email, nome, cnpj, telefone },
      });
    }
    return administradorFundo;
  }

  private async obterOuCriarRepresentante(
    fundo: CriarFundoDto | CriarFactoringDto | CriarSecuritizadoraDto,
    prisma: Prisma.TransactionClient,
    admininstrador_fundo?: administrador_fundo,
    tipo_estrutura?: string,
  ) {
    if (
      fundo.cpf_representante ||
      fundo.email_representante ||
      fundo.telefone_representante
    ) {
      let representante: any = await prisma.representante_fundo.findFirst({
        where: {
          OR: [
            { cpf: fundo.cpf_representante },
            { telefone: fundo.telefone_representante },
            { email: fundo.email_representante },
          ],
        },
        include: {
          administrador_fundo_representante_fundo: {
            include: { representante_fundo: true, administrador_fundo: true },
          },
        },
      });
      if (
        tipo_estrutura === PerfisInvestimento.FUNDO &&
        representante &&
        'email_administrador' in fundo &&
        representante.administrador_fundo_representante_fundo
          .administrador_fundo &&
        representante.administrador_fundo_representante_fundo
          .administrador_fundo.email !== fundo.email_administrador
      ) {
        throw new BadRequestException({
          mensagem: 'Representante associado a outro administrador',
        });
      }

      if (!representante) {
        const enderecoRepresentante = await prisma.endereco.create({
          data: {
            cep: fundo.cep_endereco_representante,
            bairro: fundo.bairro_endereco_representante,
            estado: fundo.estado_endereco_representante,
            cidade: fundo.municipio_endereco_representante,
            logradouro: fundo.rua_endereco_representante,
            numero: fundo.numero_endereco_representante,
            pais: 'Brasil',
          },
        });

        representante = await prisma.representante_fundo.create({
          data: {
            cpf: fundo.cpf_representante,
            email: fundo.email_representante,
            nome: fundo.nome_representante,
            telefone: fundo.telefone_representante,
            id_endereco: enderecoRepresentante.id,
          },
        });
        if (tipo_estrutura === PerfisInvestimento.FUNDO) {
          await prisma.administrador_fundo_representante_fundo.create({
            data: {
              id_administrador_fundo: admininstrador_fundo!.id,
              id_representante_fundo: representante.id,
            },
          });
        }
      } else {
        if (tipo_estrutura === PerfisInvestimento.FUNDO) {
          const administradorFundoRepresentanteFundo =
            await prisma.administrador_fundo_representante_fundo.findFirst({
              where: {
                id_representante_fundo: representante.id,
                id_administrador_fundo: admininstrador_fundo?.id,
              },
            });
          if (!administradorFundoRepresentanteFundo) {
            await prisma.administrador_fundo_representante_fundo.create({
              data: {
                id_administrador_fundo: admininstrador_fundo!.id,
                id_representante_fundo: representante.id,
              },
            });
          }
        }
      }

      return representante;
    }
    return null;
  }

  private async obterStatusFundo(prisma: Prisma.TransactionClient) {
    return await prisma.status_fundo_investimento.findFirst({
      where: { nome: StatusFundoInvestimento.AGUARDANDO_ANALISE },
    });
  }

  private async criarContaRepasse(
    idFundo: number,
    fundo: CriarFundoDto | CriarFactoringDto | CriarSecuritizadoraDto,
    prisma: Prisma.TransactionClient,
  ) {
    return await prisma.conta_repasse.create({
      data: {
        codigo_banco: fundo.codigo_banco,
        agencia: fundo.agencia_banco,
        conta_bancaria: fundo.conta_banco,
        fundo_investimento: {
          connect: { id: idFundo },
        },
      },
    });
  }

  private async ligarFundoComGestor(
    idFundo: number,
    idGestor: number,
    prisma: Prisma.TransactionClient,
  ) {
    return await prisma.fundo_investimento_gestor_fundo.create({
      data: {
        id_fundo_investimento: idFundo,
        id_gestor_fundo: idGestor,
      },
    });
  }

  private async associarFundoComUsuario(
    fundoGestorFundo: fundo_investimento_gestor_fundo,
    idUsuario: number,
    prisma: Prisma.TransactionClient,
  ) {
    return await prisma.usuario_fundo_investimento.create({
      data: {
        id_fundo_investimento_gestor_fundo: fundoGestorFundo?.id,
        id_usuario: idUsuario,
        acesso_permitido: true,
      },
    });
  }

  private async obterStatusFundoPatch(status?: string) {
    return await this.prisma.status_fundo_investimento.findFirst({
      where: { nome: status || StatusFundoInvestimento.AGUARDANDO_ANALISE },
    });
  }

  private async atualizarStatusFundo(
    idFundo: number,
    statusFundo: status_fundo_investimento,
  ) {
    const fundoAtualizado = await this.prisma.fundo_investimento.update({
      where: { id: idFundo },
      data: {
        id_status_fundo_investimento: statusFundo.id,
      },
      include: {
        fundo_backoffice: true,
        status_fundo_investimento: true,
        conta_repasse: true,
        administrador_fundo: true,
      },
    });

    return {
      mensagem: 'Status atualizado com sucesso',
      fundo_atualizado: fundoAtualizado,
    };
  }

  private async atualizarEntidadesAssociadas(
    fundo: fundo_investimento,
    data: AtualizarFundoDto,
    prisma: Prisma.TransactionClient,
  ) {
    if (
      data.email_backoffice &&
      data.nome_backoffice &&
      data.telefone_backoffice
    ) {
      await prisma.fundo_backoffice.update({
        where: { id: fundo.id_fundo_backoffice },
        data: {
          email: data.email_backoffice,
          nome: data.nome_backoffice,
          telefone: data.telefone_backoffice,
        },
      });
    }

    if (
      data.email_administrador &&
      data.nome_administrador &&
      data.telefone_administrador
    ) {
      await prisma.administrador_fundo.update({
        where: { id: fundo.id_administrador_fundo },
        data: {
          email: data.email_administrador,
          nome: data.nome_administrador,
          telefone: data.telefone_administrador,
          cnpj: data.cnpj_administrador,
        },
      });
    }

    if (
      data.nome_representante &&
      data.telefone_representante &&
      data.cpf_representante
    ) {
      const representanteAtual = await prisma.representante_fundo.findUnique({
        where: { id: fundo.id_representante_fundo },
      });

      if (representanteAtual) {
        await prisma.representante_fundo.update({
          where: { id: representanteAtual.id },
          data: {
            nome: data.nome_representante,
            telefone: data.telefone_representante,
            cpf: data.cpf_representante,
            email: data.email_representante,
          },
        });

        await prisma.endereco.update({
          where: { id: representanteAtual.id_endereco },
          data: {
            cep: data.cep_endereco_representante,
            logradouro: data.rua_endereco_representante,
            numero: data.numero_endereco_representante,
            bairro: data.bairro_endereco_representante,
            cidade: data.municipio_endereco_representante,
            estado: data.estado_endereco_representante,
          },
        });
      }
    }

    if (data.codigo_banco && data.agencia_banco && data.conta_banco) {
      await prisma.conta_repasse.update({
        where: { id_fundo_investimento: fundo.id },
        data: {
          codigo_banco: data.codigo_banco,
          agencia: data.agencia_banco,
          conta_bancaria: data.conta_banco,
        },
      });
    }
  }
  private async removerEntidadesAssociadasEFundo(
    fundo: any,
    idGestorFundo: number,
  ) {
    await this.prisma.$transaction(async (prisma) => {
      const fundoInvestimentoGestorFundo =
        await prisma.fundo_investimento_gestor_fundo.findMany({
          where: {
            id_fundo_investimento: fundo.id,
            id_gestor_fundo: idGestorFundo,
          },
        });

      for (const fundo of fundoInvestimentoGestorFundo) {
        await prisma.usuario_fundo_investimento.deleteMany({
          where: { id_fundo_investimento_gestor_fundo: fundo.id },
        });
        await prisma.fundo_investimento_gestor_fundo.delete({
          where: { id: fundo.id },
        });
      }

      await prisma.conta_repasse.deleteMany({
        where: { id_fundo_investimento: fundo.id },
      });

      await prisma.documento.deleteMany({
        where: { id_fundo_investimento: fundo.id },
      });

      const fundosComBackoffice = await prisma.fundo_investimento.findMany({
        where: { id_fundo_backoffice: fundo.id_fundo_backoffice },
      });

      if (fundosComBackoffice.length === 1) {
        await prisma.fundo_backoffice.delete({
          where: { id: fundo.id_fundo_backoffice },
        });
      }

      const fundosComAdministrador = await prisma.fundo_investimento.findMany({
        where: { id_administrador_fundo: fundo.id_administrador_fundo },
      });

      await prisma.procurador_fundo_fundo_investimento.deleteMany({
        where: { id_fundo_investimento: fundo.id },
      });

      if (fundo.tipo_estrutura === PerfisInvestimento.FUNDO) {
        const procurador = await prisma.procurador_fundo.findUnique({
          where: {
            id: fundo.procurador_fundo_fundo_investimento[0]
              .id_procurador_fundo,
          },
        });

        const procuradorFundoFundoInvesimento =
          await prisma.procurador_fundo_fundo_investimento.findMany({
            where: {
              id_procurador_fundo: procurador?.id,
            },
          });
        if (procuradorFundoFundoInvesimento.length == 0) {
          await prisma.procurador_fundo.delete({
            where: {
              id: procurador?.id,
            },
          });
          await prisma.endereco.delete({
            where: { id: procurador?.id_endereco! },
          });
        }
      }

      await prisma.fundo_investimento.delete({ where: { id: fundo.id } });

      const fundosComRepresentante = await prisma.fundo_investimento.findMany({
        where: { id_representante_fundo: fundo.id_representante_fundo },
      });

      if (fundosComAdministrador.length === 1) {
        const administradorFundoRepresentanteFundo =
          await prisma.administrador_fundo_representante_fundo.findFirst({
            where: {
              id_representante_fundo: fundo.id_representante_fundo!,
              id_administrador_fundo: fundo.id_administrador_fundo!,
            },
          });
        await prisma.administrador_fundo_representante_fundo.delete({
          where: { id: administradorFundoRepresentanteFundo!.id },
        });
        await prisma.administrador_fundo.delete({
          where: { id: fundo.id_administrador_fundo },
        });
      }

      if (fundosComRepresentante.length === 1) {
        await prisma.representante_fundo.delete({
          where: { id: fundo.id_representante_fundo },
        });
      }
    });
  }

  async verificarPropriedadeFundo(idUsuario: number, idFundo: number) {
    const fundoGestor =
      await this.prisma.fundo_investimento_gestor_fundo.findFirst({
        where: { id_fundo_investimento: idFundo },
      });

    if (!fundoGestor) {
      throw new NotFoundException({
        mensagem: 'Fundo de investimento não encontrado.',
      });
    }

    const usuarioFundo = await this.prisma.usuario_fundo_investimento.findFirst(
      {
        where: {
          id_usuario: idUsuario,
          id_fundo_investimento_gestor_fundo: fundoGestor.id,
        },
      },
    );
    console.log(fundoGestor.id);

    if (!usuarioFundo) {
      throw new ForbiddenException({
        mensagem: 'Acesso negado. Você não é o proprietário deste fundo.',
      });
    }

    return fundoGestor;
  }

  private async cadastrarProcurador(
    idFundo: number,
    fundoDto: CriarFundoDto,
    prisma: Prisma.TransactionClient,
  ) {
    let procurador = await prisma.procurador_fundo.findFirst({
      where: { cpf: fundoDto.cpf_procurador },
    });

    if (!procurador) {
      const enderecoProcurador = await prisma.endereco.create({
        data: {
          logradouro: fundoDto.rua_endereco_procurador,
          bairro: fundoDto.bairro_endereco_procurador,
          cidade: fundoDto.municipio_endereco_procurador,
          numero: fundoDto.numero_endereco_procurador,
          cep: fundoDto.cep_endereco_procurador,
          estado: fundoDto.estado_endereco_procurador,
          pais: 'Brasil',
        },
      });

      procurador = await prisma.procurador_fundo.create({
        data: {
          cpf: fundoDto.cpf_procurador,
          email: fundoDto.email_procurador,
          nome: fundoDto.nome_procurador,
          telefone: fundoDto.telefone_procurador,
          id_endereco: enderecoProcurador.id,
        },
      });
    }

    await prisma.procurador_fundo_fundo_investimento.create({
      data: {
        id_fundo_investimento: idFundo,
        id_procurador_fundo: procurador.id,
      },
    });

    return procurador;
  }

  private async fundoJaExistente(
    prisma: Prisma.TransactionClient,
    cnpjFundo: string,
  ) {
    const fundoJaExiste = await prisma.fundo_investimento.findFirst({
      where: {
        cpf_cnpj: cnpjFundo,
      },
    });
    if (fundoJaExiste) {
      throw new ConflictException({
        mensagem: `Fundo com o cpf_cnpj ${cnpjFundo} já esxiste`,
      });
    }
  }

  private async removerEntidadesAssociadasEFactoringOuSecuritizadora(
    id: number,
    assetId: number,
    perfilInvestimento: string,
  ) {
    await this.prisma.$transaction(async (prisma) => {
      const fundo = await prisma.fundo_investimento.findUnique({
        where: {
          id: id,
          tipo_estrutura: perfilInvestimento,
        },
      });

      if (!fundo) {
        throw new NotFoundException('Factoring não encontrada');
      }

      const fundoInvestimentoGestor =
        await prisma.fundo_investimento_gestor_fundo.findMany({
          where: {
            id_fundo_investimento: fundo.id,
            id_gestor_fundo: assetId,
          },
        });

      await Promise.all(
        fundoInvestimentoGestor.map(async (gestor) => {
          const usuarioFundo =
            await prisma.usuario_fundo_investimento.findFirst({
              where: { id_fundo_investimento_gestor_fundo: gestor.id },
            });

          if (usuarioFundo) {
            await prisma.usuario_fundo_investimento.delete({
              where: { id: usuarioFundo.id },
            });
          }

          await prisma.fundo_investimento_gestor_fundo.delete({
            where: { id: gestor.id },
          });
        }),
      );

      const fundosBackoffice = await prisma.fundo_investimento.findMany({
        where: { id_fundo_backoffice: fundo?.id_fundo_backoffice },
      });

      await prisma.documento.deleteMany({
        where: { id_fundo_investimento: fundo.id },
      });

      await prisma.conta_repasse.delete({
        where: {
          id_fundo_investimento: fundo.id,
        },
      });

      const fundosRepresentante = await prisma.fundo_investimento.findMany({
        where: { id_representante_fundo: fundo.id_representante_fundo! },
      });

      await prisma.fundo_investimento.delete({
        where: { id: fundo.id },
      });

      if (fundosRepresentante.length === 1) {
        await prisma.representante_fundo.delete({
          where: { id: fundo.id_representante_fundo! },
        });
      }

      if (fundosBackoffice.length === 1) {
        await prisma.fundo_backoffice.delete({
          where: { id: fundo.id_fundo_backoffice! },
        });
      }
    });
  }
}

// TODO: Refatorar código conforme sugestões abaixo
// SUGESTÕES PARA REFATORAR FUTURAMENTE:
// 1. Criar método genérico que substitua os métodos "criarFundo", "criarSecuritizadora" e "criarFactoring".
// 2. Criar um serviço especializado para remoção de fundos e entidades associadas, pois os métodos atuais são muito extensos.
// 3. Criar um método genérico que faça a remoção de fundos, securitizadoras e factoring.
// 4. Buscar por repetições de código e criar métodos genéricos para substituir essas repetições.
