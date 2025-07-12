# Folder Creation in Projects

This document describes the automatic folder creation functionality when creating projects.

## Overview

When a new project is created via the POST `/proyectos` endpoint, the system automatically creates folders in MinIO storage based on the project name and optional initial folder structure.

## Folder Structure

### Project Folder
- **Path**: `proyectos/{sanitized_project_name}_{project_id}/`
- **Example**: `proyectos/mi_proyecto_123/`

### Initial Folders
The `carpeta_inicial` parameter allows you to specify a JSON structure for creating initial folders within the project:

### Etapa Tipo Folders
The system automatically creates folders based on the `carpetas_iniciales` field from the `etapas_tipo` table. These folders are created in addition to any manually specified initial folders.

```json
{
  "carpetas": [
    {
      "nombre": "Carpeta 1"
    },
    {
      "nombre": "Carpeta 2"
    },
    {
      "nombre": "Carpeta 3"
    }
  ]
}
```

This will create the following folder structure:
```
proyectos/mi_proyecto_123/
├── Carpeta 1/
├── Carpeta 2/
├── Carpeta 3/
├── [Etapa Tipo Folder 1]/
├── [Etapa Tipo Folder 2]/
└── [Etapa Tipo Folder 3]/
```

### Etapa Tipo Folder Structure

The `carpetas_iniciales` field in the `etapas_tipo` table can have different JSON structures:

#### Structure 1: Array of objects
```json
{
  "carpetas_iniciales": [
    { "nombre": "Documentos" },
    { "nombre": "Planos" },
    { "nombre": "Fotos" }
  ]
}
```

#### Structure 2: Object with carpetas array
```json
{
  "carpetas_iniciales": {
    "carpetas": [
      { "nombre": "Documentos" },
      { "nombre": "Planos" },
      { "nombre": "Fotos" }
    ]
  }
}
```

#### Structure 3: Object with folder names as keys
```json
{
  "carpetas_iniciales": {
    "Documentos": {},
    "Planos": {},
    "Fotos": {}
  }
}
```

## API Usage

### Creating a Project with Initial Folders

```bash
POST /proyectos
Content-Type: application/json

{
  "nombre": "Mi Proyecto",
  "creado_por": 1,
  "division_id": 1,
  "departamento_id": 1,
  "unidad_id": 1,
  "carpeta_inicial": {
    "carpetas": [
      {
        "nombre": "Documentos"
      },
      {
        "nombre": "Planos"
      },
      {
        "nombre": "Fotos"
      }
    ]
  },
  "etapas_registro": {
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "usuario_creador": 1
  }
}
```

### Getting Project Folders

```bash
GET /proyectos/{id}/carpetas
```

**Response:**
```json
{
  "success": true,
  "message": "Carpetas del proyecto obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Mi Proyecto",
      "descripcion": "Carpeta raíz del proyecto: Mi Proyecto",
      "s3_path": "proyectos/mi_proyecto_123",
      "s3_bucket_name": "gestor-files",
      "orden_visualizacion": 0,
      "fecha_creacion": "2024-01-01T00:00:00.000Z",
      "carpeta_padre_id": null,
      "carpetas_hijas": [
        {
          "id": 2,
          "nombre": "Documentos",
          "descripcion": "Carpeta inicial del proyecto",
          "s3_path": "proyectos/mi_proyecto_123/Documentos",
          "orden_visualizacion": 1
        }
      ]
    }
  ]
}
```

## Environment Variables

The following environment variables are required for MinIO configuration:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=gestor-files
```

## Configuring Etapa Tipo Folders

To configure automatic folder creation for specific etapa types, update the `carpetas_iniciales` field in the `etapas_tipo` table:

### Using SQL
```sql
-- Example for "Diseño" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Diseños"},
  {"nombre": "Planos de Diseño"},
  {"nombre": "Especificaciones"},
  {"nombre": "Memorias de Cálculo"},
  {"nombre": "Renderizados"}
]'
WHERE nombre = 'Diseño';
```

### Using Prisma
```typescript
await prisma.etapas_tipo.update({
  where: { nombre: 'Diseño' },
  data: {
    carpetas_iniciales: [
      { nombre: "Diseños" },
      { nombre: "Planos de Diseño" },
      { nombre: "Especificaciones" },
      { nombre: "Memorias de Cálculo" },
      { nombre: "Renderizados" }
    ]
  }
});
```

See `scripts/etapa-tipo-carpetas-example.sql` for more examples.

## Error Handling

- If folder creation fails, the project creation will still succeed
- Errors are logged to the console for debugging
- The system will attempt to create the bucket if it doesn't exist

## Implementation Details

### Files Modified
- `src/utils/minio-utils.ts` - MinIO utility functions
- `src/utils/carpeta-db-utils.ts` - Database operations for carpetas table
- `src/http/routes/proyectos/proyectos.ts` - Project creation endpoint with DB integration

### Key Features
- Automatic bucket creation if it doesn't exist
- Sanitized folder names (removes special characters)
- Recursive folder creation
- Error handling and logging
- Non-blocking folder creation (project creation continues even if folders fail)
- Automatic folder creation from etapa_tipo carpetas_iniciales
- Support for multiple JSON structures in carpetas_iniciales
- **Database records creation** - Creates records in the `carpetas` table for all folders
- **Project folder hierarchy** - Maintains parent-child relationships between folders
- **Folder metadata** - Stores S3 paths, permissions, and configuration in database

## Testing

To test the folder creation:

1. Ensure MinIO is running and accessible
2. Set the required environment variables
3. Create a project with the `carpeta_inicial` parameter
4. Check the MinIO console or use the `/files` endpoint to verify folder creation

## Troubleshooting

### Common Issues

1. **MinIO Connection Failed**
   - Check if MinIO is running
   - Verify environment variables
   - Check network connectivity

2. **Bucket Creation Failed**
   - Ensure MinIO credentials are correct
   - Check MinIO permissions

3. **Folder Creation Failed**
   - Check MinIO logs
   - Verify bucket exists
   - Check folder name sanitization

4. **Prisma Schema Validation Errors**
   - Run `npx prisma generate` after schema changes
   - Check for duplicate relation names in schema
   - Verify all relations have unique names

5. **Database Record Creation Failed**
   - Check database connection
   - Verify table structure matches schema
   - Check for required fields and constraints

### Logs

The system provides detailed logging for debugging:
- Project folder creation status
- Initial folder creation status
- Error messages with context
- MinIO operation results 