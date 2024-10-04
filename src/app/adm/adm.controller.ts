import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdmService } from './adm.service';
import { CreateUsuarioDto } from '../usuarios/dto/criar-usuario.dto';
import {
  AtualizarSenhaMasterDto,
  AtualizarUsuarioDto,
} from './dto/update-adm.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardAdm } from '../auth/guards/adm-auth.guard';

@ApiTags('Administrador')
@ApiBearerAuth('access-token')
@Controller('api/adm')
export class AdmController {
  constructor(private readonly admService: AdmService) {}
  @UseGuards(JwtAuthGuardAdm)
  @Post()
  async criarUsuario(@Body() createAdmDto: CreateUsuarioDto) {
    return await this.admService.criarUsuario(createAdmDto);
  }

  @UseGuards(JwtAuthGuardAdm)
  @Get()
  async buscarUsuarios(
    @Query('tipo_usuario') tipoUsuarioQuery: string,
    @Query('pagina') pagina: string,
    @Query('limite') limite: string,
  ) {
    const page = parseInt(pagina) || 0;
    const limit = parseInt(limite) || 10;
    return await this.admService.buscarUsuarios(tipoUsuarioQuery, page, limit);
  }

  @Patch('senha-master')
  async alterarSenhaMaster(
    @Body() atualizarSenhaMasterDto: AtualizarSenhaMasterDto,
  ) {
    return await this.admService.alterarSenhaMaster(atualizarSenhaMasterDto);
  }

  @Get(':id')
  async buscarUsuario(@Param('id') id: string) {
    return await this.admService.buscarUsuarioPorId(Number(id));
  }

  @Patch(':id')
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto,
  ) {
    return await this.admService.atualizarUsuario(
      Number(id),
      atualizarUsuarioDto,
    );
  }

  @Delete(':id')
  async excluirUsuario(@Param('id') id: string) {
    return await this.admService.excluirUsuario(Number(id));
  }
}
