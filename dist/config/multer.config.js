"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUploadOptions = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const AVATAR_UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'avatars');
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;
exports.avatarUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, callback) => {
            if (!(0, fs_1.existsSync)(AVATAR_UPLOAD_DIR)) {
                (0, fs_1.mkdirSync)(AVATAR_UPLOAD_DIR, { recursive: true });
            }
            callback(null, AVATAR_UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
            const nomeUnico = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, nomeUnico);
        },
    }),
    limits: { fileSize: TAMANHO_MAXIMO_BYTES },
    fileFilter: (_req, file, callback) => {
        if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
            callback(new common_1.BadRequestException('Formato de arquivo inválido. Envie uma imagem JPEG, PNG ou WEBP.'), false);
            return;
        }
        callback(null, true);
    },
};
//# sourceMappingURL=multer.config.js.map