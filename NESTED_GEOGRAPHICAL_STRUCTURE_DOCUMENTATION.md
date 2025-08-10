# Nested Geographical Structure Implementation

## Overview

This document describes the implementation of a new nested geographical structure for the project endpoints. The system now accepts geographical data in a hierarchical format instead of flat arrays.

## Changes Made

### 1. Schema Updates

#### POST `/proyectos` Schema
**Before:**
```typescript
etapas_registro: z.object({
  // ... other fields
  regiones: z.array(z.number()).optional(),
  provincias: z.array(z.number()).optional(),
  comunas: z.array(z.number()).optional(),
  // ... other fields
})
```

**After:**
```typescript
etapas_registro: z.object({
  // ... other fields
  regiones: z.array(z.object({
    id: z.number(),
    provincias: z.array(z.object({
      id: z.number(),
      comunas: z.array(z.object({
        id: z.number()
      }))
    }))
  })).optional(),
  // ... other fields
})
```

#### PUT `/proyectos/:id` Schema
Similar changes were applied to the PUT endpoint schema.

### 2. Helper Functions

#### `extractComunaIdsFromNestedStructure`
```typescript
function extractComunaIdsFromNestedStructure(regiones: any[]): number[] {
  const comunaIds: number[] = [];
  
  regiones.forEach(region => {
    region.provincias.forEach((provincia: any) => {
      provincia.comunas.forEach((comuna: any) => {
        comunaIds.push(comuna.id);
      });
    });
  });
  
  return comunaIds;
}
```

This function extracts all commune IDs from the nested structure for database processing.

### 3. Processing Logic Updates

#### POST Route
- Changed from processing `etapas_registro.comunas` array directly
- Now processes `etapas_registro.regiones` using the helper function
- Extracts commune IDs and fetches their complete geographical hierarchy

#### PUT Route
- Updated both update and create scenarios
- Removed references to separate `provincias` and `comunas` arrays
- Now processes the nested `regiones` structure

## Input Format

### New Nested Structure
```json
{
  "nombre": "Mi Proyecto",
  "division_id": 1,
  "departamento_id": 1,
  "unidad_id": 1,
  "creado_por": 1,
  "etapas_registro": {
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "tipo_obra_id": 1,
    "regiones": [
      {
        "id": 1,
        "provincias": [
          {
            "id": 1,
            "comunas": [
              { "id": 1 },
              { "id": 2 }
            ]
          }
        ]
      }
    ],
    "volumen": "1000 m3",
    "presupuesto_oficial": "1000000",
    "valor_referencia": "Test Value",
    "bip": "123456",
    "usuario_creador": 1
  }
}
```

### Old Flat Structure (Deprecated)
```json
{
  "etapas_registro": {
    "regiones": [1],
    "provincias": [1],
    "comunas": [1, 2]
  }
}
```

## Database Storage

The geographical data is still stored in the unified `etapas_geografia` table with the following structure:

```sql
CREATE TABLE etapas_geografia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  etapa_registro_id INT NOT NULL,
  region_id INT NOT NULL,
  provincia_id INT NOT NULL,
  comuna_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  UNIQUE(etapa_registro_id, region_id, provincia_id, comuna_id)
);
```

Each record represents a specific commune with its complete geographical hierarchy.

## Processing Flow

1. **Input Validation**: Zod schema validates the nested structure
2. **Commune Extraction**: `extractComunaIdsFromNestedStructure` extracts all commune IDs
3. **Database Lookup**: For each commune ID, fetch the complete geographical hierarchy
4. **Record Creation**: Create `etapas_geografia` records with all three IDs populated
5. **Data Retrieval**: The `transformGeographicalData` function reconstructs the nested structure for responses

## Benefits

1. **Intuitive Input**: The nested structure matches the natural geographical hierarchy
2. **Data Integrity**: Ensures all geographical relationships are properly established
3. **Flexibility**: Supports multiple regions, provinces, and communes in a single request
4. **Consistency**: Maintains the same database storage model while improving the API interface

## Testing

A test file `test_nested_geographical_structure.js` was created to verify the functionality:

```bash
node test_nested_geographical_structure.js
```

The test confirms that:
- Commune IDs are correctly extracted from the nested structure
- Database lookups return the complete geographical hierarchy
- The processing logic works as expected

## Migration Notes

- Existing endpoints continue to work with the new structure
- The database schema remains unchanged
- The `transformGeographicalData` function still reconstructs the nested structure for responses
- All geographical data is stored with complete hierarchy information

## Example Usage

### Creating a Project with Nested Geographical Data
```bash
curl -X POST http://localhost:3000/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Proyecto Test",
    "division_id": 1,
    "departamento_id": 1,
    "unidad_id": 1,
    "creado_por": 1,
    "etapas_registro": {
      "etapa_tipo_id": 1,
      "tipo_iniciativa_id": 1,
      "regiones": [
        {
          "id": 1,
          "provincias": [
            {
              "id": 1,
              "comunas": [
                { "id": 1 },
                { "id": 2 }
              ]
            }
          ]
        }
      ],
      "usuario_creador": 1
    }
  }'
```

This implementation provides a more intuitive and structured way to handle geographical data while maintaining backward compatibility with the existing database schema.
