import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@ApiExcludeController()
@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth(): string {
    return 'Hello World!';
  }
}
