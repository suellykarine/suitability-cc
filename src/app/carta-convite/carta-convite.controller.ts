import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { decodificarToken } from 'src/utils/extrairId';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReenviarCodigoDto } from './dto/resend-code.dto';
import { CartaConviteService } from './carta-convite.service';
import { AtualizarCartaConviteDto } from './dto/update-invitation-letter.dto';
import { CriarCartaConviteDto } from './dto/create-invitation-letter.dto';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';
import { VerificarCodigoCartaConviteDto } from './dto/verify-invitation-letter.dto';
import { TipoUsuario } from 'src/enums/TipoUsuario';

@ApiTags('Carta-convite')
@Controller('api/carta-convite')
export class CartaConviteController {
  constructor(private readonly cartaConviteService: CartaConviteService) {}

  @Post()
  criar(
    @Body() criarCartaConviteDto: CriarCartaConviteDto,
    @Headers() headers: any,
  ) {
    const token = headers.authorization.split(' ')[1];
    const tokenDecodificado = decodificarToken(token);

    let userId: number | undefined;
    if (tokenDecodificado) {
      userId =
        tokenDecodificado.tipoUsuario<TipoUsuario> === 'BACKOFFICE'
          ? tokenDecodificado.idUsuario
          : undefined;
    }

    return this.cartaConviteService.criarCartaConvite(
      criarCartaConviteDto,
      userId,
    );
  }

  @Post('reenviar-codigo')
  reenviarCodigo(@Body() reenviarCodigoDto: ReenviarCodigoDto) {
    return this.cartaConviteService.reenviarCodigo(reenviarCodigoDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  encontrarTodos() {
    return this.cartaConviteService.encontrarTodasCartasConvite();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuardBackoffice)
  @Get(':id')
  encontrarUm(@Param('id') id: string) {
    return this.cartaConviteService.encontrarUmaCartaConvite(+id);
  }

  @Patch('verificar')
  verificar(
    @Body() verificarCodigoCartaConviteDto: VerificarCodigoCartaConviteDto,
  ) {
    return this.cartaConviteService.verificarCodigo(
      verificarCodigoCartaConviteDto,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuardBackoffice)
  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() atualizarCartaConviteDto: AtualizarCartaConviteDto,
  ) {
    return this.cartaConviteService.atualizarCartaConvite(
      +id,
      atualizarCartaConviteDto,
    );
  }
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuardBackoffice)
  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id') id: string) {
    return this.cartaConviteService.removerCartaConvite(+id);
  }
}
