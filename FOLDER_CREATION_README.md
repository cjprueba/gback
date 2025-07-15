# Folder Creation in Projects

This document describes the automatic folder creation functionality when creating projects.

## Overview

When a new project is created via the POST `/proyectos` endpoint, the system automatically creates folders in MinIO storage based on the project name and optional initial folder structure.

## Folder Structure

### Project Folder
- **Path**: `proyectos/{sanitized_project_name}_{project_id}/`
- **Example**: `proyectos/mi_proyecto_123/`

### Initial Folders
The `carpeta_inicial` parameter allows you to specify a JSON structure for creating initial folders within the project. The system now supports both flat and nested structures.

#### Flat Structure (Legacy)
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

#### Nested Structure (New)
```json
{
  "Proyecto en Licitación": {
    "Proyectos": {
      "Proyecto de Licitación": {},
      "Proyecto de Adjudicación": {}
    }
  }
}
```

This will create the following folder structure:
```
proyectos/mi_proyecto_123/
├── Proyecto en Licitación/
│   └── Proyectos/
│       ├── Proyecto de Licitación/
│       └── Proyecto de Adjudicación/
├── [Etapa Tipo Folder 1]/
├── [Etapa Tipo Folder 2]/
└── [Etapa Tipo Folder 3]/
```

### Etapa Tipo Folder Structure

The `carpetas_iniciales` field in the `etapas_tipo` table can have different JSON structures:

#### Structure 1: Array of objects (Legacy)
```json
{
  "carpetas_iniciales": [
    { "nombre": "Documentos" },
    { "nombre": "Planos" },
    { "nombre": "Fotos" }
  ]
}
```

#### Structure 2: Object with carpetas array (Legacy)
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

#### Structure 3: Object with folder names as keys (Legacy)
```json
{
  "carpetas_iniciales": {
    "Documentos": {},
    "Planos": {},
    "Fotos": {}
  }
}
```

#### Structure 4: Nested structure (New)
```json
{
  "carpetas_iniciales": {
    "Diseño": {
      "Planos": {
        "Planos Arquitectónicos": {},
        "Planos Estructurales": {},
        "Planos Mecánicos": {},
        "Planos Eléctricos": {}
      },
      "Especificaciones": {
        "Especificaciones Técnicas": {},
        "Especificaciones de Materiales": {}
      },
      "Memorias": {
        "Memoria de Cálculo": {},
        "Memoria Descriptiva": {}
      }
    }
  }
}
```

## API Usage

### Creating a Project with Nested Initial Folders

```bash
POST /proyectos
Content-Type: application/json

{
  "nombre": "Proyecto de Carretera",
  "creado_por": 1,
  "division_id": 1,
  "departamento_id": 1,
  "unidad_id": 1,
  "carpeta_inicial": {
    "Proyecto en Licitación": {
      "Proyectos": {
        "Proyecto de Licitación": {},
        "Proyecto de Adjudicación": {}
      }
    }
  },
  "etapas_registro": {
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "usuario_creador": 1
  }
}
```

### Creating a Project with Flat Initial Folders (Backward Compatibility)

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
          "nombre": "Proyecto en Licitación",
          "descripcion": "Carpeta inicial del proyecto",
          "s3_path": "proyectos/mi_proyecto_123/Proyecto en Licitación",
          "orden_visualizacion": 1,
          "carpetas_hijas": [
            {
              "id": 3,
              "nombre": "Proyectos",
              "descripcion": "Carpeta inicial del proyecto",
              "s3_path": "proyectos/mi_proyecto_123/Proyecto en Licitación/Proyectos",
              "orden_visualizacion": 1,
              "carpetas_hijas": [
                {
                  "id": 4,
                  "nombre": "Proyecto de Licitación",
                  "descripcion": "Carpeta inicial del proyecto",
                  "s3_path": "proyectos/mi_proyecto_123/Proyecto en Licitación/Proyectos/Proyecto de Licitación",
                  "orden_visualizacion": 1
                },
                {
                  "id": 5,
                  "nombre": "Proyecto de Adjudicación",
                  "descripcion": "Carpeta inicial del proyecto",
                  "s3_path": "proyectos/mi_proyecto_123/Proyecto en Licitación/Proyectos/Proyecto de Adjudicación",
                  "orden_visualizacion": 2
                }
              ]
            }
          ]
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

### Using SQL - Nested Structure Example
```sql
-- Example for "Licitación" etapa tipo with nested structure
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Proyecto en Licitación": {
    "Proyectos": {
      "Proyecto de Licitación": {},
      "Proyecto de Adjudicación": {}
    }
  }
}'
WHERE nombre = 'Licitación';
```

### Using SQL - Complex Nested Structure Example
```sql
-- Example for "Diseño" etapa tipo with complex nested structure
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Diseño": {
    "Planos": {
      "Planos Arquitectónicos": {},
      "Planos Estructurales": {},
      "Planos Mecánicos": {},
      "Planos Eléctricos": {}
    },
    "Especificaciones": {
      "Especificaciones Técnicas": {},
      "Especificaciones de Materiales": {}
    },
    "Memorias": {
      "Memoria de Cálculo": {},
      "Memoria Descriptiva": {}
    }
  }
}'
WHERE nombre = 'Diseño';
```

### Using SQL - Flat Structure (Backward Compatibility)
```sql
-- Example for "General" etapa tipo with flat structure
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Documentos"},
  {"nombre": "Planos"},
  {"nombre": "Fotos"},
  {"nombre": "Contratos"},
  {"nombre": "Estudios"}
]'
WHERE nombre = 'General';
```

### Using Prisma
```typescript
// Nested structure example
await prisma.etapas_tipo.update({
  where: { nombre: 'Licitación' },
  data: {
    carpetas_iniciales: {
      "Proyecto en Licitación": {
        "Proyectos": {
          "Proyecto de Licitación": {},
          "Proyecto de Adjudicación": {}
        }
      }
    }
  }
});

// Flat structure example (backward compatibility)
await prisma.etapas_tipo.update({
  where: { nombre: 'General' },
  data: {
    carpetas_iniciales: [
      { nombre: "Documentos" },
      { nombre: "Planos" },
      { nombre: "Fotos" },
      { nombre: "Contratos" },
      { nombre: "Estudios" }
    ]
  }
});
```

See `scripts/test-nested-folders.sql` for more examples.

## Error Handling

- If folder creation fails, the project creation will still succeed
- Errors are logged to the console for debugging
- The system will attempt to create the bucket if it doesn't exist

## Implementation Details

### Files Modified
- `src/utils/minio-utils.ts` - MinIO utility functions with nested folder support
- `src/utils/carpeta-db-utils.ts` - Database operations for carpetas table with nested structure support
- `src/http/routes/proyectos/proyectos.ts` - Project creation endpoint with DB integration

### Key Features
- **Backward Compatibility** - Supports both flat and nested structures
- **Automatic bucket creation** if it doesn't exist
- **Sanitized folder names** (removes special characters)
- **Recursive folder creation** for nested structures
- **Error handling and logging**
- **Non-blocking folder creation** (project creation continues even if folders fail)
- **Automatic folder creation** from etapa_tipo carpetas_iniciales
- **Support for multiple JSON structures** in carpetas_iniciales
- **Database records creation** - Creates records in the `carpetas` table for all folders
- **Project folder hierarchy** - Maintains parent-child relationships between folders
- **Folder metadata** - Stores S3 paths, permissions, and configuration in database
- **Proper descriptions** - Different descriptions for initial folders vs etapa tipo folders

## Testing

To test the nested folder creation:

1. Ensure MinIO is running and accessible
2. Set the required environment variables
3. Run the SQL examples from `scripts/test-nested-folders.sql` and `scripts/test-nested-etapa-tipo.sql`
4. Create a project with the new nested `carpeta_inicial` structure
5. Verify that both MinIO folders and database records are created correctly
6. Check that proper descriptions are assigned to folders (initial vs etapa tipo)

### Example Test Cases

1. **Nested Structure Test:**
   ```json
   {
     "carpeta_inicial": {
       "Proyecto en Licitación": {
         "Proyectos": {
           "Proyecto de Licitación": {},
           "Proyecto de Adjudicación": {}
         }
       }
     }
   }
   ```

2. **Flat Structure Test (Backward Compatibility):**
   ```json
   {
     "carpeta_inicial": {
       "carpetas": [
         {"nombre": "Documentos"},
         {"nombre": "Planos"},
         {"nombre": "Fotos"}
       ]
     }
   }
   ```

3. **Mixed Structure Test:**
   - Use nested structure in `carpeta_inicial`
   - Use flat structure in `etapas_tipo.carpetas_iniciales`
   - Verify both work correctly together 