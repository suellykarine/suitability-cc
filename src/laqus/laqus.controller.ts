import {
  Body,
  Post,
  Param,
  Get,
  UsePipes,
  HttpCode,
  HttpStatus,
  Controller,
  HttpException,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AutenticarLaqusDto } from './dto/autenticarLaqus.dto';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { AutenticarLaqusService } from './services/autenticarLaqus.service';
import { CriarInvestidorLaqusService } from './services/criarInvestidorLaqus.service';
import { buscarStatusInvestidorLaqusService } from './services/buscarStatusInvestidorLaqus.service';

@ApiTags('Laqus')
@Controller('api/laqus')
@UsePipes(ZodValidationPipe)
@ApiBearerAuth('access-token')
export class LaqusController {
  constructor(
    private readonly AutenticarLaqusService: AutenticarLaqusService,
    private readonly criarInvestidorLaqusService: CriarInvestidorLaqusService,
    private readonly buscarStatusInvestidorLaqusService: buscarStatusInvestidorLaqusService,
  ) {}

  @Get('autenticar')
  @HttpCode(HttpStatus.OK)
  async autenticar() {
    try {
      const body: AutenticarLaqusDto = {
        apiKey: process.env.LAQUS_API_KEY,
        secretKey: process.env.LAQUS_SECRET_KEY,
      };

      const token = await this.AutenticarLaqusService.autenticar(body);

      return token;
    } catch (error) {
      const message = error.message || 'Erro ao autenticar';
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(message, status);
    }
  }

  @Post('cadastrar')
  async cadastrar(@Body() criarInvestidorLaqusDto: CriarInvestidorLaqusDto) {
    try {
      const { accessToken } = await this.autenticar();

      const cadastro = await this.criarInvestidorLaqusService.criarInvestidor(
        criarInvestidorLaqusDto,
        accessToken,
      );

      return {
        id: cadastro.id,
      };
    } catch (error) {
      const usuarioExiste = error.message.includes('Cadastro já existe');
      if (usuarioExiste) throw new BadRequestException('Cadastro já existe');

      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Erro ao cadastrar o investidor';

      throw new HttpException(message, status);
    }
  }

  @Get('buscar-status-investidor/:id')
  async buscarStatus(@Param('id') id: string) {
    try {
      const { accessToken } = await this.autenticar();

      const buscarStatusInvestidor =
        await this.buscarStatusInvestidorLaqusService.buscarStatusInvestidor({
          id,
          token: accessToken,
        });

      return buscarStatusInvestidor;
    } catch (error) {
      const usuarioExiste = error.message.includes('Validation failed');
      if (usuarioExiste) throw new BadRequestException('Cadastro já existe');

      const uuidInvalido = error.message.includes('Validation failed');
      if (uuidInvalido)
        throw new BadRequestException('O ID fornecido não é um UUID válido.');

      const message = error.message || 'Erro ao buscar status do investidor';
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(message, status);
    }
  }
}
