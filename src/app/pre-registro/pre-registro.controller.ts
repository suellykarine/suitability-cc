import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { PreRegistroService } from './pre-registro.service';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../autenticacao/guards/jwt-auth.guard';
import { JwtAuthGuardPreRegistro } from '../autenticacao/guards/pre-register-auth.guard';
import {
  CriarUsuarioDto,
  CriarCodigoDeVerificacaoDto,
} from './dto/criar-pre-registro.dto';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';

@ApiTags('Pre-registro')
@ApiBearerAuth('access-token')
@Controller('api/pre-registro')
export class PreRegistroController {
  constructor(private readonly preRegistroService: PreRegistroService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  encontrarTodosUsuarios() {
    return this.preRegistroService.encontrarTodosUsuarios();
  }

  @UseGuards(JwtAuthGuardPreRegistro)
  @Get('senha')
  encontrarCartaConvite(@Request() req) {
    const cartaConvite = req.cartaConvite;
    return this.preRegistroService.encontrarCartaConvite(cartaConvite);
  }

  @UseGuards(JwtAuthGuardPreRegistro)
  @Post('senha')
  criarUsuario(
    @Body() criarUsuarioDto: CriarUsuarioDto,
    @Request() req: any,
    @Headers() headers: any,
  ) {
    const cartaConvite = req.cartaConvite;
    const token = headers.authorization.split(' ')[1];

    return this.preRegistroService.criarUsuario(
      criarUsuarioDto,
      cartaConvite,
      token,
    );
  }

  @Post('codigo-verificacao')
  enviarCodigoDeVerificacao(
    @Body() criarCodigoDeVerificacaoDto: CriarCodigoDeVerificacaoDto,
  ) {
    return this.preRegistroService.enviarCodigoDeVerificacao(
      criarCodigoDeVerificacaoDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  encontrarUmUsuario(
    @Param('id') id: string,
    @Request() req: RequisicaoPersonalizada,
  ) {
    const reqIdUsuario = req.user.idUsuario;
    return this.preRegistroService.encontrarUmUsuario(+id, reqIdUsuario);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removerUsuario(
    @Param('id') id: string,
    @Request() req: RequisicaoPersonalizada,
  ) {
    const reqIdUsuario = req.user.idUsuario;
    return this.preRegistroService.removerUsuario(+id, reqIdUsuario);
  }
}
