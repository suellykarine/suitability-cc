import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  gestor_fundo,
  fundo_investimento_gestor_fundo,
} from '@prisma/client';
import { formatarCNPJ } from 'src/utils/formatar';
import { StatusFundoInvestimento } from 'src/enums/StatusFundoInvestimento';
import { PerfisInvestimento } from 'src/enums/PerfisInvestimento';
import { CriarFundoDto } from './dto/criar-fundo.dto';
import { CriarFactoringDto } from './dto/criar-factoring.dto';
import { CriarSecuritizadoraDto } from './dto/criar-securitizaroda.dto copy';

@Injectable()
export class FundosService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async criarFundo(id: number, criarFundoDto: CriarFundoDto[]) {
    const usuario = await this.obterUsuario(id);

    return this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const fundosCriados = [];
        for (const fundo of criarFundoDto) {
          const novoFundo = await this.criarNovoFundo(fundo, usuario, prisma);
          fundosCriados.push(novoFundo);
        }

        return {
          mensagem: 'Fundos criados com sucesso',
          fundos_criados: fundosCriados,
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
      administradorFundoFinal.id,
      prisma,
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
        administrador_fundo: { include: { representante_fundo: true } },
        status_fundo_investimento: true,
      },
    });

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

    return novoFundo;
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
    const representante = await this.obterOuCriarRepresentante(
      fundo,
      gestorFundo.id,
      prisma,
    );
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
    const representante = await this.obterOuCriarRepresentante(
      fundo,
      gestorFundo.id,
      prisma,
    );
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
    idAdministradorFundo: number,
    prisma: Prisma.TransactionClient,
    tipo_estrutura?: string,
  ) {
    if (
      fundo.cpf_representante ||
      fundo.email_representante ||
      fundo.telefone_representante
    ) {
      let representante = await prisma.representante_fundo.findFirst({
        where: {
          OR: [
            { cpf: fundo.cpf_representante },
            { telefone: fundo.telefone_representante },
            { email: fundo.email_representante },
          ],
        },
      });

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
            id_administrador_fundo:
              tipo_estrutura !== PerfisInvestimento.FUNDO
                ? null
                : idAdministradorFundo,
          },
        });
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

  async buscarFundos() {
    const fundos = await this.prisma.fundo_investimento.findMany();
    return fundos.map((fundo) => {
      return {
        ...fundo,
        cnpj: formatarCNPJ(fundo.cpf_cnpj),
      };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} fundo`;
  }

  remove(id: number) {
    return `This action removes a #${id} fundo`;
  }
}
