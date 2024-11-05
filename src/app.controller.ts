import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './app/autenticacao/guards/local-auth.guard';
import { AutenticacaoService } from './app/autenticacao/auth.service';
import { LoginDto } from './app/autenticacao/dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private autenticacaoService: AutenticacaoService,
  ) {}

  @ApiTags('health')
  @ApiOperation({ summary: 'Rota de health da aplicação' })
  @Get()
  getHealth(): string {
    return this.appService.getService();
  }
}
