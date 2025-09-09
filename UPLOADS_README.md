# Sistema de Almacenamiento de Archivos de WhatsApp

## Descripción

Este sistema permite descargar y almacenar archivos multimedia (imágenes, videos, audios, documentos) recibidos a través de webhooks de WhatsApp.

## Estructura de Carpetas

```
uploads/
└── whatsapp/
    ├── [uuid].jpg
    ├── [uuid].mp4
    ├── [uuid].pdf
    └── ...
```

## Funcionamiento

### 1. Descarga de Archivos
- Cuando se recibe un webhook con media, el sistema:
  - Extrae la información del archivo (ID, tipo MIME, nombre original)
  - Descarga el archivo desde la API de WhatsApp
  - Genera un nombre único usando UUID
  - Guarda el archivo en `uploads/whatsapp/`

### 2. Información Almacenada
El campo `media` en la base de datos contiene un JSON con:

```json
{
  "fileName": "abc123.jpg",
  "originalName": "foto_perfil.jpg",
  "filePath": "uploads/whatsapp/abc123.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 1024000,
  "mediaId": "whatsapp_media_id",
  "sha256": "hash_sha256",
  "downloadedAt": "2024-01-01T12:00:00.000Z"
}
```

### 3. Tipos de Archivo Soportados

#### Imágenes
- JPEG, JPG, PNG, GIF, WebP

#### Videos
- MP4, AVI, MOV, WMV

#### Audio
- MP3, WAV, OGG, M4A

#### Documentos
- PDF, DOC, DOCX, XLS, XLSX, TXT

## Configuración

### Variables de Entorno
```env
DATABASE_URL=postgresql://...
```

### Permisos de Carpeta
Asegúrate de que la carpeta `uploads/` tenga permisos de escritura.

## Mantenimiento

### Limpieza de Archivos Antiguos
Los archivos se almacenan indefinidamente. Considera implementar una tarea programada para limpiar archivos antiguos.

### Backup
La carpeta `uploads/` debe incluirse en tu estrategia de backup.

## Seguridad

- Los archivos se almacenan con nombres únicos (UUID)
- La carpeta `uploads/` está excluida del control de versiones
- Los archivos se validan por tipo MIME antes de guardar

## API Endpoints

### Obtener Archivo
```typescript
// El archivo se puede servir desde la ruta:
GET /uploads/whatsapp/[filename]
```

### Información del Media
```typescript
// La información completa está en el campo 'media' de la tabla whatsapp_messages
// Se puede consultar con Prisma:
const message = await prisma.whatsappMessage.findFirst({
  where: { messageId: 'msg_id' },
  select: { media: true }
});

const mediaInfo = JSON.parse(message.media);
```

## Troubleshooting

### Error: "Carpeta no encontrada"
- Verifica que la carpeta `uploads/whatsapp/` exista
- Asegúrate de que el proceso tenga permisos de escritura

### Error: "Tipo MIME no soportado"
- El archivo se guardará con extensión `.bin`
- Verifica que el tipo MIME esté en la lista de soportados

### Archivo corrupto
- Verifica la conexión a internet durante la descarga
- Revisa los logs para errores de descarga
