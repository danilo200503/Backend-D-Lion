import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { ClientesModule } from '../clientes/clientes.module';
import { PlanoTributarioController } from './plano-tributario.controller';
import { PlanoTributarioService } from './plano-tributario.service';

@Module({
  imports: [UsersModule, AiModule, ClientesModule],
  controllers: [PlanoTributarioController],
  providers: [PlanoTributarioService],
  exports: [PlanoTributarioService],
})
export class PlanoTributarioModule {}
