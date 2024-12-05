import { Module } from '@nestjs/common';
import { AnalisePerfilService } from './analise-perfil.service';
import { AnalisePerfilController } from './analise-perfil.controller';
import { FundosService } from '../fundos/fundos.service';
import { PrismaService } from 'prisma/prisma.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { PrismaFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoRepositorio';
import { CadastroPessoaJuridicaService } from '../sigma/cadastro-pessoa-juridica.service';
import { ConfigService } from '@nestjs/config';
import { ProcuradorFundoRepositorio } from 'src/repositorios/contratos/procuradorFundoRepositorio';
import { PrismaProcuradorFundoRepositorio } from 'src/repositorios/prisma/prismaProcuradorFundoRepositorio';
import { EnderecoRepositorio } from 'src/repositorios/contratos/enderecoRepositorio';
import { PrismaEnderecoRepositorio } from 'src/repositorios/prisma/prismaEnderecoRepositoio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { PrismaUsuarioFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaUsuarioFundoInvestimento';
import { FundoBackofficeRepositorio } from 'src/repositorios/contratos/fundoBackofficeRepositorio';
import { PrismaFundoBackofficeRepositorio } from 'src/repositorios/prisma/prismaFundoBackofficeRepositorio';
import { AdministradorFundoRepositorio } from 'src/repositorios/contratos/admininstradorFundoRepositorio';
import { PrismaAdministradorFundoRepositorio } from 'src/repositorios/prisma/prismaAdministradorFundoRepositorio';
import { RepresentanteFundoRepositorio } from 'src/repositorios/contratos/representanteFundoRepositorio';
import { PrismaRepresentanteFundoRepositorio } from 'src/repositorios/prisma/prismaRepresentanteFundoRepositorio';
import { AdministradorFundoRepresentanteFundoRepositorio } from 'src/repositorios/contratos/administradorFundoRepresentanteFundoRepositorio';
import { PrismaAdministradorFundoRepresentanteFundoRepositorio } from 'src/repositorios/prisma/prismaAdministradorFundoRepresentanteFundoRepositorio';
import { GestorFundoRepositorio } from 'src/repositorios/contratos/gestorFundoRepositorio';
import { PrismaGestorFundoRepositorio } from 'src/repositorios/prisma/prismaGestorFundoRepositorio';
import { StatusFundoInvestimentoRepositorio } from 'src/repositorios/contratos/statusFundoInvestimentoRepositorio';
import { PrismaStatusFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaStatusFundoInvestimentoRepositorio';
import { ContaRepasseRepositorio } from 'src/repositorios/contratos/contaRepasseRepositorio';
import { PrismaContaRepasseRepositorio } from 'src/repositorios/prisma/prismaContaRepasseRepositorio';
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { PrismaFundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/prisma/prismaFundoInvestimentoGestorFundoRepositorio';
import { DocumentoRepositorio } from 'src/repositorios/contratos/documentoRepositorio';
import { PrismaDocumentoRepositorio } from 'src/repositorios/prisma/prismaDocumentoRepositorio';
import { ProcuradorFundoFundoInvestimentoRepositorio } from 'src/repositorios/contratos/procuradorFundoFundoInvestimentoRepositorio';
import { PrismaProcuradorFundoFundoInvestimentoRepositorio } from 'src/repositorios/prisma/prismaProcuradorFundoFundoInvestimentoRepositorio';

@Module({
  controllers: [AnalisePerfilController],
  providers: [
    AnalisePerfilService,
    FundosService,
    PrismaService,
    CadastroPessoaJuridicaService,
    ConfigService,
    {
      provide: FundoInvestimentoRepositorio,
      useClass: PrismaFundoInvestimentoRepositorio,
    },
    {
      provide: ProcuradorFundoRepositorio,
      useClass: PrismaProcuradorFundoRepositorio,
    },
    {
      provide: EnderecoRepositorio,
      useClass: PrismaEnderecoRepositorio,
    },
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
    {
      provide: UsuarioFundoInvestimentoRepositorio,
      useClass: PrismaUsuarioFundoInvestimentoRepositorio,
    },
    {
      provide: FundoBackofficeRepositorio,
      useClass: PrismaFundoBackofficeRepositorio,
    },
    {
      provide: AdministradorFundoRepositorio,
      useClass: PrismaAdministradorFundoRepositorio,
    },
    {
      provide: RepresentanteFundoRepositorio,
      useClass: PrismaRepresentanteFundoRepositorio,
    },
    {
      provide: AdministradorFundoRepresentanteFundoRepositorio,
      useClass: PrismaAdministradorFundoRepresentanteFundoRepositorio,
    },
    {
      provide: GestorFundoRepositorio,
      useClass: PrismaGestorFundoRepositorio,
    },
    {
      provide: StatusFundoInvestimentoRepositorio,
      useClass: PrismaStatusFundoInvestimentoRepositorio,
    },
    {
      provide: ContaRepasseRepositorio,
      useClass: PrismaContaRepasseRepositorio,
    },
    {
      provide: FundoInvestimentoGestorFundoRepositorio,
      useClass: PrismaFundoInvestimentoGestorFundoRepositorio,
    },
    {
      provide: DocumentoRepositorio,
      useClass: PrismaDocumentoRepositorio,
    },
    {
      provide: ProcuradorFundoFundoInvestimentoRepositorio,
      useClass: PrismaProcuradorFundoFundoInvestimentoRepositorio,
    },
  ],
})
export class AnalisePerfilModule {}
