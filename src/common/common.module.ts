import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ExecutionTimeMiddleware } from './middlewares/execution-time.middleware';
import { LanguageMiddleware } from './middlewares/language.middleware';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';
import { UserIdentificationMiddleware } from './middlewares/user-identification.middleware';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    JwtModule.register({}),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        RequestIdMiddleware,
        LanguageMiddleware,
        UserIdentificationMiddleware,
        ExecutionTimeMiddleware,
      )
      .forRoutes('*');
  }
}
