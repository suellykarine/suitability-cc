import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutenticacaoService } from './autenticacao.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from 'src/app/autenticacao/dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { fazerNada } from 'src/utils/funcoes/geral';

@ApiTags('Autenticação')
@Controller('api/autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    fazerNada(loginDto);
    return this.autenticacaoService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: RequisicaoPersonalizada) {
    return this.autenticacaoService.logout(req.user.idUsuario);
  }

  @ApiOperation({ summary: 'Renovar o token de acesso' })
  @HttpCode(HttpStatus.OK)
  @Post('renovar-token')
  async renovarToken(@Body('tokenRenovacao') tokenRenovacao: string) {
    return this.autenticacaoService.renovarToken(tokenRenovacao);
  }
}
