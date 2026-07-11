import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const XML_UPLOAD_DIR = join(process.cwd(), 'uploads', 'fiscal');
const EXTENSOES_PERMITIDAS = ['.xml'];
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; 

export const fiscalXmlUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      if (!existsSync(XML_UPLOAD_DIR)) {
        mkdirSync(XML_UPLOAD_DIR, { recursive: true });
      }
      callback(null, XML_UPLOAD_DIR);
    },
    filename: (_req, file, callback) => {
      const nomeUnico = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, nomeUnico);
    },
  }),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
  fileFilter: (_req, file, callback) => {
    const extensao = extname(file.originalname).toLowerCase();
    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      callback(new BadRequestException('Formato de arquivo inválido. Envie um arquivo XML.'), false);
      return;
    }
    callback(null, true);
  },
};
