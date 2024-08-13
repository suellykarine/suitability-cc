import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CartaConviteService } from './carta-convite.service';
import { CriarCartaConviteDto } from './dto/create-invitation-letter.dto';
import { AtualizarCartaConviteDto } from './dto/update-invitation-letter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';
import { Headers } from '@nestjs/common';
import { decodificarToken } from 'src/utils/extrairId';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { VerificarCodigoCartaConviteDto } from './dto/verify-invitation-letter.dto';
import { ReenviarCodigoDto } from './dto/resend-code.dto';

@ApiTags('carta-convite')
@ApiBearerAuth('access-token')
@Controller('api/carta-convite')
export class CartaConviteController {
  constructor(private readonly cartaConviteService: CartaConviteService) {}

  @Post()
  criar(
    @Body() criarCartaConviteDto: CriarCartaConviteDto,
    @Headers() headers: any,
  ) {
    let tokenDecodificado;
    if (headers.authorization) {
      tokenDecodificado = decodificarToken(headers.authorization.split(' ')[1]);
    }

    let userId: number | undefined;
    if (tokenDecodificado) {
      userId =
        tokenDecodificado.typeUser === TipoUsuario.BACKOFFICE
          ? tokenDecodificado.idUser
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

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  encontrarTodos() {
    return this.cartaConviteService.encontrarTodasCartasConvite();
  }

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

  @UseGuards(JwtAuthGuardBackoffice)
  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id') id: string) {
    return this.cartaConviteService.removerCartaConvite(+id);
  }
}
