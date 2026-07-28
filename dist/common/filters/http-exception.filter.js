"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const statusCode = this.resolveStatusCode(exception);
        const { message, errors } = this.resolveMessage(exception);
        const errorBody = {
            success: false,
            message,
            errors,
            status: statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.requestId,
        };
        this.logger.error(`[${request.method}] ${request.url} - ${statusCode} - ${message}`, exception instanceof Error ? exception.stack : undefined, 'GlobalExceptionFilter');
        response.status(statusCode).json(errorBody);
    }
    resolveStatusCode(exception) {
        if (exception instanceof common_1.HttpException) {
            return exception.getStatus();
        }
        return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
    resolveMessage(exception) {
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            if (typeof response === 'string') {
                return { message: response, errors: [response] };
            }
            if (typeof response === 'object' && response !== null) {
                const responseObj = response;
                const rawMessage = responseObj.message ?? responseObj.error ?? exception.message;
                const errors = Array.isArray(rawMessage) ? rawMessage : [String(rawMessage)];
                const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
                return { message, errors };
            }
        }
        if (exception instanceof Error) {
            return { message: exception.message, errors: [exception.message] };
        }
        return { message: 'Erro interno do servidor.', errors: ['Erro interno do servidor.'] };
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], GlobalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map