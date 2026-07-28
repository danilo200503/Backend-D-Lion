"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const execution_time_middleware_1 = require("./middlewares/execution-time.middleware");
const language_middleware_1 = require("./middlewares/language.middleware");
const request_id_middleware_1 = require("./middlewares/request-id.middleware");
const user_identification_middleware_1 = require("./middlewares/user-identification.middleware");
let CommonModule = class CommonModule {
    configure(consumer) {
        consumer
            .apply(request_id_middleware_1.RequestIdMiddleware, language_middleware_1.LanguageMiddleware, user_identification_middleware_1.UserIdentificationMiddleware, execution_time_middleware_1.ExecutionTimeMiddleware)
            .forRoutes('*');
    }
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 100,
                },
            ]),
            jwt_1.JwtModule.register({}),
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map