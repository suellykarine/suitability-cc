import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { StatusUsuarioService } from './status-usuario.service';
import { AtualizarStatusUsuarioDto } from './dto/atualizar-status.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';

@ApiTags('Status-usuario')
@ApiBearerAuth('access-token')
@Controller('api/status-usuario')
@UseGuards(JwtAuthGuardBackoffice)
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
