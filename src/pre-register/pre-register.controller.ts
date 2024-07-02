import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PreRegisterService } from './pre-register.service';
import { CreatePreRegisterDto } from './dto/create-pre-register.dto';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { ModifyAuthorization } from 'decorators/authorization.decorator';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';

@Controller('api/pre-register')
export class PreRegisterController {
  constructor(private readonly preRegisterService: PreRegisterService) {}

  @Post()
  create(@Body() createPreRegisterDto: CreatePreRegisterDto) {
    return this.preRegisterService.create(createPreRegisterDto);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @ModifyAuthorization()
  @Get()
  findAll(@Headers() headers: any) {
    console.log(headers.authorization);
    return this.preRegisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preRegisterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePreRegisterDto: UpdatePreRegisterDto,
  ) {
    return this.preRegisterService.update(+id, updatePreRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preRegisterService.remove(+id);
  }
}
