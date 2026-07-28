"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageMiddleware = void 0;
const common_1 = require("@nestjs/common");
const IDIOMA_PADRAO = 'pt-BR';
let LanguageMiddleware = class LanguageMiddleware {
    use(req, _res, next) {
        const acceptLanguage = req.headers['accept-language'];
        req.language = acceptLanguage ? acceptLanguage.split(',')[0].trim() : IDIOMA_PADRAO;
        next();
    }
};
exports.LanguageMiddleware = LanguageMiddleware;
exports.LanguageMiddleware = LanguageMiddleware = __decorate([
    (0, common_1.Injectable)()
], LanguageMiddleware);
//# sourceMappingURL=language.middleware.js.map