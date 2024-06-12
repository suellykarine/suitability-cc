import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InvitationLetterService } from './invitation-letter.service';
import { CreateInvitationLetterDto } from './dto/create-invitation-letter.dto';
import { UpdateInvitationLetterDto } from './dto/update-invitation-letter.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';
import { Headers } from '@nestjs/common';
import { decodeToken } from 'src/utils/extractId';
import { jwtConstants } from 'src/auth/constants';
import { TipoUsuario } from 'src/enums/TipoUsuario';

@ApiTags('invitation-letter')
@Controller('api/invitation-letter')
export class InvitationLetterController {
  constructor(
    private readonly invitationLetterService: InvitationLetterService,
  ) {}

  @Post()
  create(
    @Body() createInvitationLetterDto: CreateInvitationLetterDto,
    @Headers() headers: any,
  ) {
    let decoded;
    if (headers.authorization) {
      decoded = decodeToken(
        headers.authorization.split(' ')[1],
        jwtConstants.secret,
      );
    }

    const userId =
      decoded.typeUser === TipoUsuario.BACKOFFICE ? decoded.idUser : undefined;

    return this.invitationLetterService.create(
      createInvitationLetterDto,
      userId,
    );
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  findAll() {
    return this.invitationLetterService.findAll();
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationLetterService.findOne(+id);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvitationLetterDto: UpdateInvitationLetterDto,
  ) {
    return this.invitationLetterService.update(+id, updateInvitationLetterDto);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationLetterService.remove(+id);
  }
}
