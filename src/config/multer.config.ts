import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; 

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      if (!existsSync(AVATAR_UPLOAD_DIR)) {
        mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
      }
      callback(null, AVATAR_UPLOAD_DIR);
    },
    filename: (_req, file, callback) => {
      const nomeUnico = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, nomeUnico);
    },
  }),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      callback(new BadRequestException('Formato de arquivo inválido. Envie uma imagem JPEG, PNG ou WEBP.'), false);
      return;
    }
    callback(null, true);
  },
};
