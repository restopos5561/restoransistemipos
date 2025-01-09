import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors/bad-request-error';

export class UploadService {
  private static UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private static ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor() {
    // Uploads klasörünü oluştur
    if (!fs.existsSync(UploadService.UPLOAD_DIR)) {
      fs.mkdirSync(UploadService.UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadBase64Image(base64String: string | null): Promise<string | undefined> {
    if (!base64String) {
      return undefined;
    }

    try {
      // Base64 formatını kontrol et
      if (!base64String.includes(';base64,')) {
        throw new BadRequestError('Geçersiz base64 formatı');
      }

      // MIME type ve base64 verisini ayır
      const [mimeType, base64Data] = base64String.split(';base64,');
      const fileType = mimeType.split(':')[1];

      // MIME type kontrolü
      if (!UploadService.ALLOWED_MIME_TYPES.includes(fileType)) {
        throw new BadRequestError('Desteklenmeyen dosya türü');
      }

      // Base64'ü buffer'a çevir
      const buffer = Buffer.from(base64Data, 'base64');

      // Dosya boyutu kontrolü
      if (buffer.length > UploadService.MAX_FILE_SIZE) {
        throw new BadRequestError('Dosya boyutu çok büyük');
      }

      // Benzersiz dosya adı oluştur
      const fileName = `${uuidv4()}.${fileType.split('/')[1]}`;
      const filePath = path.join(UploadService.UPLOAD_DIR, fileName);

      // Dosyayı kaydet
      await fs.promises.writeFile(filePath, buffer);

      // Dosya URL'ini döndür
      return `/uploads/${fileName}`;
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('Dosya yükleme hatası:', error);
      throw new BadRequestError('Dosya yüklenirken bir hata oluştu');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl.startsWith('/uploads/')) {
        return;
      }

      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        return;
      }

      const filePath = path.join(UploadService.UPLOAD_DIR, fileName);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Dosya silme hatası:', error);
    }
  }
} 