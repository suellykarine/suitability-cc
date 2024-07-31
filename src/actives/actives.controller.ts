import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivesService } from './actives.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryDto } from './dto/query-actives.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('actives')
@ApiBearerAuth('access-token')
@Controller('api/actives')
export class ActivesController {
  constructor(private readonly activesService: ActivesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() params: QueryDto) {
    return this.activesService.findAll(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get('general')
  general() {
    return this.activesService.general();
  }
}
