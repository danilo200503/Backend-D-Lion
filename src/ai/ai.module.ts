import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FiscalModule } from '../fiscal/fiscal.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AnthropicService } from './services/anthropic.service';
import { IaUsoService } from './services/ia-uso.service';

@Module({
  imports: [UsersModule, FiscalModule],
  controllers: [AiController],
  providers: [AiService, AnthropicService, IaUsoService],
  exports: [AiService, AnthropicService, IaUsoService],
})
export class AiModule {}
