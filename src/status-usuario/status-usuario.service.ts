import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { AtualizarStatusUsuarioDto } from './dto/atualizar-status.dto';

@Injectable()
export class StatusUsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async atualizarStatusUsuario(
    idUsuario: number,
    atualizarStatusUsuarioDto: AtualizarStatusUsuarioDto,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      include: { status_usuario: true },
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (
      usuario.status_usuario!.nome === StatusUsuario.APROVADO ||
      usuario.status_usuario!.nome === StatusUsuario.RECUSADO ||
      usuario.status_usuario!.nome === StatusUsuario.PRIMEIRO_ACESSO_PREMIUM
    ) {
      throw new ConflictException('Este usuário já foi analisado');
    }

    let idTipoUsuario: number | null = null;
    let idStatusUsuario: number | null = null;
    const statusUpperCase = atualizarStatusUsuarioDto.status.toUpperCase();

    if (statusUpperCase === StatusUsuario.APROVADO) {
      idTipoUsuario = (
        await this.prisma.tipo_usuario.findFirst({
          where: { tipo: TipoUsuario.INVESTIDOR_PREMIUM },
        })
      )?.id;
    } else if (statusUpperCase === StatusUsuario.RECUSADO) {
      idTipoUsuario = (
        await this.prisma.tipo_usuario.findFirst({
          where: { tipo: TipoUsuario.INVESTIDOR_TRIAL },
        })
      )?.id;
    }

    idStatusUsuario = (
      await this.prisma.status_usuario.findFirst({
        where: { nome: statusUpperCase },
      })
    )?.id;

    if (!idStatusUsuario) {
      throw new BadRequestException('Status não encontrado');
    }

    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id: idUsuario },
      data: {
        id_status_usuario: idStatusUsuario ?? usuario.id_status_usuario,
        id_tipo_usuario: idTipoUsuario ?? usuario.id_tipo_usuario,
      },
      select: this.selecionarCamposUsuario(),
    });

    return usuarioAtualizado;
  }

  private selecionarCamposUsuario() {
    return {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      id_tipo_usuario: true,
      id_status_usuario: true,
      cpf: true,
      data_nascimento: true,
      id_gestor_fundo: true,
      id_endereco: true,
      data_criacao: true,
    };
  }
}
