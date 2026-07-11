import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FiscalModule } from '../fiscal/fiscal.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [UsersModule, FiscalModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
