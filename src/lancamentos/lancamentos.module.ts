import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { LancamentosController } from './lancamentos.controller';
import { LancamentosService } from './lancamentos.service';

@Module({
  imports: [UsersModule, AiModule],
  controllers: [LancamentosController],
  providers: [LancamentosService],
  exports: [LancamentosService],
})
export class LancamentosModule {}
