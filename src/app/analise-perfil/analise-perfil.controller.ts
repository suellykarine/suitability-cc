import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalisePerfilService } from './analise-perfil.service';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Analise-perfil')
@ApiBearerAuth('access-token')
@Controller('api/analise-perfil')
export class AnalisePerfilController {
  constructor(private readonly analisePerfilService: AnalisePerfilService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  obterUsuarios() {
    return this.analisePerfilService.obterUsuarios();
  }
}
