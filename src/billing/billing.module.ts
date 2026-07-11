import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { EmailService } from './email.service';

@Module({
  imports: [UsersModule],
  controllers: [BillingController],
  providers: [BillingService, EmailService],
  exports: [BillingService],
})
export class BillingModule {}
