import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CriarFeedbackDto } from './dto/criar-feedback.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequisicaoPersonalizada } from 'src/utils/interfaces/requisicao.interface';
import { JwtAuthGuardBackoffice } from '../autenticacao/guards/backoffice-auth.guard';

@ApiTags('Feedback')
@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Post()
  async criarFeedback(
    @Body() criarFeedbackDto: CriarFeedbackDto,
    @Request() req: RequisicaoPersonalizada,
  ) {
    return this.feedbackService.criarFeedback(
      criarFeedbackDto,
      req.user.idUsuario,
    );
  }
}
