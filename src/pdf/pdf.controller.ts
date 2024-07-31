import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('api/pdf')
@UseGuards(JwtAuthGuard)
@ApiTags('PDF')
@ApiBearerAuth('access-token')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pdfService.findOne(+id);
  }
}
