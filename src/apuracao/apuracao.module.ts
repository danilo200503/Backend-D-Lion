import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { ApuracaoController } from './apuracao.controller';
import { ApuracaoService } from './apuracao.service';

@Module({
  imports: [UsersModule, AiModule],
  controllers: [ApuracaoController],
  providers: [ApuracaoService],
  exports: [ApuracaoService],
})
export class ApuracaoModule {}
