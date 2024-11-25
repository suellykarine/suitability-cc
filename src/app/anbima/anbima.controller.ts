import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnbimaService } from './anbima.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../autenticacao/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Anbima')
@ApiBearerAuth('access-token')
@Controller('api/anbima')
export class AnbimaController {
  constructor(private readonly anbimaService: AnbimaService) {}

  @Get('fundos/:cnpj')
  async integracaoAnbima(@Param('cnpj') cnpj: string) {
    return await this.anbimaService.integracaoAnbima(cnpj);
  }
}
