import { ArgumentsHost, ExceptionFilter, LoggerService } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: LoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
    private resolveStatusCode;
    private resolveMessage;
}
