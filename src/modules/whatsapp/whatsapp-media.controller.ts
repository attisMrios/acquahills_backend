import { Controller, Get, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('whatsapp/media')
export class WhatsappMediaController {

  /**
   * Sirve archivos de media de WhatsApp
   * GET /api/whatsapp/media/:filename
   */
  @Get(':filename')
  async serveMedia(@Param('filename') filename: string, @Res() res: Response) {
    try {
      console.log(`🔍 Serviendo archivo de media: ${filename}`);
      
      // Construir ruta del archivo
      const filePath = path.join(process.cwd(), 'uploads', 'whatsapp', filename);
      console.log(`📁 Ruta del archivo: ${filePath}`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Archivo no encontrado: ${filePath}`);
        throw new HttpException('Archivo no encontrado', HttpStatus.NOT_FOUND);
      }

      // Obtener estadísticas del archivo
      const stats = fs.statSync(filePath);
      
      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(filename).toLowerCase();
      const mimeType = this.getMimeType(ext);
      console.log(`📄 Tipo MIME detectado: ${ext} -> ${mimeType}`);
      
      // Configurar headers de respuesta
      res.set({
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      });
      
      console.log(`📤 Enviando archivo: ${filename} (${stats.size} bytes)`);

      // Crear stream de lectura y enviar
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      console.log(`✅ Archivo enviado exitosamente: ${filename}`);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('Error sirviendo archivo de media:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtiene el tipo MIME basado en la extensión del archivo
   */
  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/avi',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
