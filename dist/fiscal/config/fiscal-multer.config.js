"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiscalXmlUploadOptions = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const XML_UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'fiscal');
const EXTENSOES_PERMITIDAS = ['.xml'];
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024;
exports.fiscalXmlUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, callback) => {
            if (!(0, fs_1.existsSync)(XML_UPLOAD_DIR)) {
                (0, fs_1.mkdirSync)(XML_UPLOAD_DIR, { recursive: true });
            }
            callback(null, XML_UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
            const nomeUnico = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, nomeUnico);
        },
    }),
    limits: { fileSize: TAMANHO_MAXIMO_BYTES },
    fileFilter: (_req, file, callback) => {
        const extensao = (0, path_1.extname)(file.originalname).toLowerCase();
        if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
            callback(new common_1.BadRequestException('Formato de arquivo inválido. Envie um arquivo XML.'), false);
            return;
        }
        callback(null, true);
    },
};
//# sourceMappingURL=fiscal-multer.config.js.map