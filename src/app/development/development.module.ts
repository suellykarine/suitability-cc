import { Module } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { DevelopmentController } from './development.controller';
import { DevelopmentService } from './development.service';

@Module({
  controllers: [DevelopmentController],
  providers: [DevelopmentService, PrismaService],
  imports: [],
})
export class DevelopmentModule {}
