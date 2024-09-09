import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CedenteService } from './cedente.service';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { UpdateCedenteDto } from './dto/update-cedente.dto';

@Controller('api/cedente')
export class CedenteController {
  constructor(private readonly cedenteService: CedenteService) {}

  @Post()
  create(@Body() createCedenteDto: CreateCedenteDto) {}

  @Get('bancos')
  buscarBancos() {
    return this.cedenteService.buscarBancos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCedenteDto: UpdateCedenteDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
