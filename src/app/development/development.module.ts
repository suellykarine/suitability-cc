import { Module } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { DevelopmentController } from './development.controller';
import { DevelopmentService } from './development.service';
import { DebenturesModule } from '../debentures/debentures.module';

@Module({
  controllers: [DevelopmentController],
  providers: [DevelopmentService, PrismaService],
  imports: [DebenturesModule],
})
export class DevelopmentModule {}
