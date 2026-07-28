"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const ai_module_1 = require("./ai/ai.module");
const auth_module_1 = require("./auth/auth.module");
const billing_module_1 = require("./billing/billing.module");
const clientes_module_1 = require("./clientes/clientes.module");
const common_module_1 = require("./common/common.module");
const company_module_1 = require("./company/company.module");
const config_module_1 = require("./config/config.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const database_module_1 = require("./database/database.module");
const email_module_1 = require("./email/email.module");
const fiscal_module_1 = require("./fiscal/fiscal.module");
const logger_module_1 = require("./logger/logger.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
            database_module_1.DatabaseModule,
            email_module_1.EmailModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            company_module_1.CompanyModule,
            dashboard_module_1.DashboardModule,
            fiscal_module_1.FiscalModule,
            ai_module_1.AiModule,
            clientes_module_1.ClientesModule,
            billing_module_1.BillingModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map