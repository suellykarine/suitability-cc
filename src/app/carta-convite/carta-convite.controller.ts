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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReenviarCodigoDto } from './dto/resend-code.dto';
import { CartaConviteService } from './carta-convite.service';
import { AtualizarCartaConviteDto } from './dto/update-invitation-letter.dto';
import { CriarCartaConviteDto } from './dto/create-invitation-letter.dto';
import { JwtAuthGuardBackoffice } from '../auth/guards/backoffice-auth.guard';
import { VerificarCodigoCartaConviteDto } from './dto/verify-invitation-letter.dto';
import { JwtAuthGuardCartaConvite } from '../auth/guards/carta-convite.guard';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';

@ApiTags('Carta-convite')
@Controller('api/carta-convite')
export class CartaConviteController {
  constructor(private readonly cartaConviteService: CartaConviteService) {}

  @UseGuards(JwtAuthGuardCartaConvite)
  @Post()
  criar(
    @Body() criarCartaConviteDto: CriarCartaConviteDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    const idUsuario = req.user ? req.user.idUsuario : undefined;
    return this.cartaConviteService.criarCartaConvite(
      criarCartaConviteDto,
      idUsuario,
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
