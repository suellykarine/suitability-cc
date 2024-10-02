import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
  HttpCode,
  Param,
  Get,
  UsePipes,
} from '@nestjs/common';
import { AutenticarLaqusService } from './services/autenticarLaqus.service';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { AutenticarLaqusDto } from './dto/autenticarLaqus.dto';
import { CriarInvestidorLaqusService } from './services/criarInvestidorLaqus.service';
import { buscarStatusInvestidorLaqusService } from './services/buscarStatusInvestidorLaqus.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@ApiTags('Laqus')
@Controller('api/laqus')
@ApiBearerAuth('access-token')
@UsePipes(ZodValidationPipe)
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
        secretKey: process.env.LAQUS_SECRET_KEY,
        apiKey: process.env.LAQUS_API_KEY,
      };

      const token = await this.AutenticarLaqusService.autenticar(body);
      return token;
    } catch (error) {
      throw new HttpException(
        error.response || { message: 'Erro ao autenticar' },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const message = error.message || 'Erro ao cadastrar o investidor';
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

      if (message.includes('Cadastro já existe')) {
        throw new HttpException(
          { message: 'Cadastro já existe' },
          HttpStatus.BAD_REQUEST,
        );
      }

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
      if (error.message.includes('Validation failed')) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'O ID fornecido não é um UUID válido.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message.includes('500')) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro interno da API.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao buscar status do investidor.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
