# Etapas Endpoints - Geographical Structure Update

## Overview

This document describes the modifications made to the etapas endpoints to support the new nested geographical structure that shows regions, provinces, and communes in a hierarchical format.

## Changes Made

### 1. Added transformGeographicalData Function

A helper function was added to transform flat geographical data from the `etapas_geografia` table into a deeply nested hierarchical structure:

```typescript
function transformGeographicalData(etapasGeografia: any[]) {
  // Create a map of regions with their provinces and communes
  const regionsMap = new Map();
  
  // Process all geographical data from the unified table
  etapasGeografia.forEach(etapaGeo => {
    const { region, provincia, comuna } = etapaGeo;
    
    // Ensure we have all the geographical data
    if (region && provincia && comuna) {
      // Add region if not exists
      if (!regionsMap.has(region.id)) {
        regionsMap.set(region.id, {
          ...region,
          etapas_provincias: []
        });
      }
      
      const regionData = regionsMap.get(region.id);
      
      // Add province if not exists
      let provinciaData = regionData.etapas_provincias.find((p: any) => p.provincia.id === provincia.id);
      if (!provinciaData) {
        provinciaData = {
          provincia: {
            ...provincia,
            etapas_comunas: []
          }
        };
        regionData.etapas_provincias.push(provinciaData);
      }
      
      // Add comuna if not exists
      if (!provinciaData.provincia.etapas_comunas.find((c: any) => c.comuna.id === comuna.id)) {
        provinciaData.provincia.etapas_comunas.push({
          comuna: comuna
        });
      }
    }
  });
  
  // Convert map to array
  return Array.from(regionsMap.values());
}
```

### 2. Updated Response Schemas

All response schemas that previously returned flat geographical fields (`region`, `provincia`, `comuna`) have been updated to use the new nested structure (`etapas_regiones`):

#### Old Structure (Deprecated)
```typescript
region: z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string()
}).nullable(),
provincia: z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string()
}).nullable(),
comuna: z.object({
  id: z.number(),
  nombre: z.string()
}).nullable(),
```

#### New Structure
```typescript
etapas_regiones: z.array(z.object({
  id: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  nombre_corto: z.string().nullable(),
  etapas_provincias: z.array(z.object({
    provincia: z.object({
      id: z.number(),
      codigo: z.string(),
      nombre: z.string(),
      region_id: z.number()
    }),
    etapas_comunas: z.array(z.object({
      comuna: z.object({
        id: z.number(),
        nombre: z.string(),
        provincia_id: z.number(),
        region_id: z.number()
      })
    }))
  }))
})).nullable(),
```

### 3. Updated Endpoints

The following endpoints have been updated to use the new geographical structure:

#### GET /etapas
- **Schema**: Updated to use `etapas_regiones` instead of flat geographical fields
- **Response**: Now transforms geographical data using `transformGeographicalData()`

#### GET /etapas/:id
- **Schema**: Updated to use `etapas_regiones` instead of flat geographical fields
- **Response**: Now transforms geographical data using `transformGeographicalData()`

#### GET /etapas/:proyecto_id/avanzar
- **Schema**: Already updated to use `etapas_regiones`
- **Response**: Now transforms geographical data using `transformGeographicalData()`

### 4. Database Queries

All endpoints that return geographical data now properly include the `etapas_geografia` relationship:

```typescript
etapas_geografia: {
  include: {
    region: true,
    provincia: true,
    comuna: true
  }
}
```

## Response Format

### Before (Flat Structure)
```json
{
  "id": 1,
  "region": {
    "id": 1,
    "nombre": "Región Metropolitana",
    "codigo": "13"
  },
  "provincia": {
    "id": 1,
    "nombre": "Santiago",
    "codigo": "131"
  },
  "comuna": {
    "id": 1,
    "nombre": "Santiago"
  }
}
```

### After (Nested Structure)
```json
{
  "id": 1,
  "etapas_regiones": [
    {
      "id": 1,
      "codigo": "13",
      "nombre": "Región Metropolitana",
      "nombre_corto": "RM",
      "etapas_provincias": [
        {
          "provincia": {
            "id": 1,
            "codigo": "131",
            "nombre": "Santiago",
            "region_id": 1
          },
          "etapas_comunas": [
            {
              "comuna": {
                "id": 1,
                "nombre": "Santiago",
                "provincia_id": 1,
                "region_id": 1
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Benefits

1. **Hierarchical Representation**: The new structure better represents the natural geographical hierarchy
2. **Multiple Locations**: Supports multiple regions, provinces, and communes per stage
3. **Consistent API**: All geographical data follows the same nested structure
4. **Better UX**: Frontend can easily display geographical data in tree-like structures
5. **Data Integrity**: Maintains proper relationships between geographical entities

## Testing

A test script has been created at `scripts/test-etapas-geographical.js` to verify:

1. Database connectivity and data availability
2. Proper retrieval of geographical relationships
3. Functionality of the `transformGeographicalData` function
4. Availability of projects for testing the endpoints

To run the test:
```bash
cd scripts
node test-etapas-geographical.js
```

## Migration Notes

- **Backward Compatibility**: The database schema remains unchanged
- **Data Source**: All geographical data is still retrieved from the `etapas_geografia` table
- **API Changes**: Response format has changed from flat to nested structure
- **Frontend Updates**: Frontend applications will need to be updated to handle the new response format

## Example Usage

### Testing the /etapas/:proyecto_id/avanzar Endpoint

```bash
curl -X GET "http://localhost:3000/etapas/1/avanzar" \
  -H "Content-Type: application/json"
```

The response will now include the nested geographical structure in `etapas_regiones` for each stage, showing the complete hierarchy of regions, provinces, and communes associated with each project stage.
