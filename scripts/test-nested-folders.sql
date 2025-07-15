-- Test script for nested folder structures
-- This script demonstrates how to configure etapas_tipo with nested folder structures

-- Example 1: Nested structure for "Proyecto en Licitación"
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

-- Example 2: More complex nested structure for "Diseño"
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

-- Example 3: Nested structure for "Construcción"
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Construcción": {
    "Obras": {
      "Obras Civiles": {},
      "Obras Mecánicas": {},
      "Obras Eléctricas": {}
    },
    "Control": {
      "Control de Calidad": {},
      "Control de Seguridad": {},
      "Control de Avance": {}
    },
    "Documentación": {
      "Fotografías": {},
      "Informes": {},
      "Certificados": {}
    }
  }
}'
WHERE nombre = 'Construcción';

-- Example 4: Flat structure (backward compatibility)
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Documentos"},
  {"nombre": "Planos"},
  {"nombre": "Fotos"},
  {"nombre": "Contratos"},
  {"nombre": "Estudios"}
]'
WHERE nombre = 'General';

-- Example 5: Object with carpetas array (backward compatibility)
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "carpetas": [
    {"nombre": "Documentos"},
    {"nombre": "Planos"},
    {"nombre": "Fotos"},
    {"nombre": "Contratos"},
    {"nombre": "Estudios"}
  ]
}'
WHERE nombre = 'Administrativo';

-- Query to view all configured etapa tipos with their carpetas_iniciales
SELECT 
  id,
  nombre,
  carpetas_iniciales
FROM etapas_tipo 
WHERE carpetas_iniciales IS NOT NULL
ORDER BY nombre;

-- Example API calls for testing:

-- 1. Create project with nested structure
/*
POST /proyectos
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
*/

-- 2. Create project with flat structure (backward compatibility)
/*
POST /proyectos
{
  "nombre": "Proyecto Simple",
  "creado_por": 1,
  "division_id": 1,
  "departamento_id": 1,
  "unidad_id": 1,
  "carpeta_inicial": {
    "carpetas": [
      {"nombre": "Documentos"},
      {"nombre": "Planos"},
      {"nombre": "Fotos"}
    ]
  },
  "etapas_registro": {
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "usuario_creador": 1
  }
}
*/

-- Expected folder structure for nested example:
/*
proyectos/proyecto_de_carretera_123/
├── Proyecto en Licitación/
│   └── Proyectos/
│       ├── Proyecto de Licitación/
│       └── Proyecto de Adjudicación/
└── [Etapa Tipo Folders]/
    └── [Based on etapas_tipo.carpetas_iniciales]
*/ 