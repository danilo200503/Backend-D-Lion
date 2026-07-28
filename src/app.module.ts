import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { ClientesModule } from './clientes/clientes.module';
import { CommonModule } from './common/common.module';
import { CompanyModule } from './company/company.module';
import { ConfigModule } from './config/config.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';
import { ApuracaoModule } from './apuracao/apuracao.module';


@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    EmailModule,
    CommonModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    DashboardModule,
    FiscalModule,
    AiModule,
    ClientesModule,
    BillingModule,
    LancamentosModule,
    ApuracaoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
