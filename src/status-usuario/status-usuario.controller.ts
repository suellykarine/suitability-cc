import {
  Controller,
  Patch,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StatusUsuarioService } from './status-usuario.service';
import { AtualizarStatusUsuarioDto } from './dto/atualizar-status.dto';

@Controller('api/status-usuario')
export class StatusUsuarioController {
  constructor(private readonly statusUsuarioService: StatusUsuarioService) {}

  @Patch(':id')
  async atualizarStatusUsuario(
    @Param('id') id: string,
    @Body() atualizarStatusUsuarioDto: AtualizarStatusUsuarioDto,
  ) {
    const usuarioAtualizado =
      await this.statusUsuarioService.atualizarStatusUsuario(
        +id,
        atualizarStatusUsuarioDto,
      );
    return {
      mensagem: 'Status atualizado',
      dados: usuarioAtualizado,
    };
  }
}
