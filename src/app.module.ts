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
import { FiscalModule } from './fiscal/fiscal.module';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    DashboardModule,
    FiscalModule,
    AiModule,
    ClientesModule,
    BillingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
