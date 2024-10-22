import { Prisma, status_usuario, tipo_usuario, usuario } from '@prisma/client';
import { AtualizarUsuarioDto } from 'src/app/adm/dto/update-adm.dto';
import { Repositorio } from './repositorio';
import { UsuarioComStatusETipo } from 'src/@types/entities/usuarioComStatusETipo';
import { UsuarioFundoInvestimento } from 'src/@types/entities/usuario';

export abstract class UsuarioFundoInvestimentoRepositorio {
  abstract encontrarPeloIdGestorFundo(
    id: number,
  ): Promise<UsuarioFundoInvestimento | null>;
}
