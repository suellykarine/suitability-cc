import {
  Controller,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';

@Controller('api/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuarioService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id/senha')
  async atualizarSenha(
    @Param('id') id: string,
    @Body() atualizarSenhaDto: AtualizarSenhaDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    if (Number(id) !== req.user.idUsuario) {
      throw new HttpException(
        'Você não tem permissão para alterar a senha deste usuário.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.usuariosService.atualizarSenha(
      req.user.idUsuario,
      atualizarSenhaDto,
    );
  }
}
