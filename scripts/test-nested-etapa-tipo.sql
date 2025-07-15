-- Test script for nested folder structures in etapa tipo
-- This script demonstrates how to configure etapas_tipo with nested folder structures

-- Example 1: Nested structure for "Licitación" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Proyecto en Licitación": {
    "Proyectos": {
      "Proyecto de Licitación": {},
      "Proyecto de Adjudicación": {}
    },
    "Documentos": {
      "Bases de Licitación": {},
      "Pliegos": {},
      "Ofertas": {}
    }
  }
}'
WHERE nombre = 'Licitación';

-- Example 2: Complex nested structure for "Diseño" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Diseño": {
    "Planos": {
      "Planos Arquitectónicos": {
        "Plantas": {},
        "Elevaciones": {},
        "Cortes": {}
      },
      "Planos Estructurales": {
        "Cimentación": {},
        "Estructura": {},
        "Detalles": {}
      },
      "Planos Mecánicos": {
        "Instalaciones Sanitarias": {},
        "Instalaciones de Gas": {}
      },
      "Planos Eléctricos": {
        "Alumbrado": {},
        "Fuerza": {},
        "Comunicaciones": {}
      }
    },
    "Especificaciones": {
      "Especificaciones Técnicas": {},
      "Especificaciones de Materiales": {},
      "Especificaciones de Calidad": {}
    },
    "Memorias": {
      "Memoria de Cálculo": {},
      "Memoria Descriptiva": {},
      "Memoria de Costos": {}
    },
    "Renderizados": {
      "Exteriores": {},
      "Interiores": {},
      "Maquetas 3D": {}
    }
  }
}'
WHERE nombre = 'Diseño';

-- Example 3: Nested structure for "Construcción" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Construcción": {
    "Obras": {
      "Obras Civiles": {
        "Cimentación": {},
        "Estructura": {},
        "Albañilería": {}
      },
      "Obras Mecánicas": {
        "Instalaciones Sanitarias": {},
        "Instalaciones de Gas": {},
        "Climatización": {}
      },
      "Obras Eléctricas": {
        "Alumbrado": {},
        "Fuerza": {},
        "Comunicaciones": {}
      }
    },
    "Control": {
      "Control de Calidad": {
        "Inspecciones": {},
        "Pruebas": {},
        "Certificados": {}
      },
      "Control de Seguridad": {
        "Protocolos": {},
        "Equipos": {},
        "Capacitación": {}
      },
      "Control de Avance": {
        "Programación": {},
        "Seguimiento": {},
        "Reportes": {}
      }
    },
    "Documentación": {
      "Fotografías": {
        "Avance de Obra": {},
        "Detalles": {},
        "Final": {}
      },
      "Informes": {
        "Diarios": {},
        "Semanales": {},
        "Mensuales": {}
      },
      "Certificados": {
        "Calidad": {},
        "Seguridad": {},
        "Ambiental": {}
      }
    }
  }
}'
WHERE nombre = 'Construcción';

-- Example 4: Nested structure for "Supervisión" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Supervisión": {
    "Control de Obra": {
      "Inspecciones": {
        "Diarias": {},
        "Semanales": {},
        "Especiales": {}
      },
      "Mediciones": {
        "Avance": {},
        "Calidad": {},
        "Cantidades": {}
      },
      "Certificaciones": {
        "Pagos": {},
        "Calidad": {},
        "Cumplimiento": {}
      }
    },
    "Gestión": {
      "Comunicaciones": {
        "Correspondencia": {},
        "Notificaciones": {},
        "Respuestas": {}
      },
      "Reuniones": {
        "Coordinación": {},
        "Técnicas": {},
        "Avance": {}
      },
      "Reportes": {
        "Diarios": {},
        "Semanales": {},
        "Mensuales": {}
      }
    },
    "Documentación": {
      "Fotografías": {
        "Avance": {},
        "Problemas": {},
        "Soluciones": {}
      },
      "Planos": {
        "As-Built": {},
        "Modificaciones": {},
        "Detalles": {}
      },
      "Informes": {
        "Técnicos": {},
        "Administrativos": {},
        "Finales": {}
      }
    }
  }
}'
WHERE nombre = 'Supervisión';

-- Example 5: Flat structure (backward compatibility) for "General" etapa tipo
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Documentos"},
  {"nombre": "Planos"},
  {"nombre": "Fotos"},
  {"nombre": "Contratos"},
  {"nombre": "Estudios"}
]'
WHERE nombre = 'General';

-- Query to view all configured etapa tipos with their carpetas_iniciales
SELECT 
  id,
  nombre,
  carpetas_iniciales
FROM etapas_tipo 
WHERE carpetas_iniciales IS NOT NULL
ORDER BY nombre;

-- Example API calls for testing etapa tipo with nested structures:

-- 1. Create project with etapa tipo that has nested structure
/*
POST /proyectos
{
  "nombre": "Proyecto de Diseño Complejo",
  "creado_por": 1,
  "division_id": 1,
  "departamento_id": 1,
  "unidad_id": 1,
  "etapas_registro": {
    "etapa_tipo_id": 2, -- Assuming "Diseño" has ID 2
    "tipo_iniciativa_id": 1,
    "usuario_creador": 1
  }
}
*/

-- 2. Create project with both nested carpeta_inicial and nested etapa tipo
/*
POST /proyectos
{
  "nombre": "Proyecto Completo",
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
    "etapa_tipo_id": 1, -- Assuming "Licitación" has ID 1
    "tipo_iniciativa_id": 1,
    "usuario_creador": 1
  }
}
*/

-- Expected folder structure for nested etapa tipo example:
/*
proyectos/proyecto_de_diseno_complejo_123/
├── [Project Root Folder]/
├── Diseño/
│   ├── Planos/
│   │   ├── Planos Arquitectónicos/
│   │   │   ├── Plantas/
│   │   │   ├── Elevaciones/
│   │   │   └── Cortes/
│   │   ├── Planos Estructurales/
│   │   │   ├── Cimentación/
│   │   │   ├── Estructura/
│   │   │   └── Detalles/
│   │   ├── Planos Mecánicos/
│   │   │   ├── Instalaciones Sanitarias/
│   │   │   └── Instalaciones de Gas/
│   │   └── Planos Eléctricos/
│   │       ├── Alumbrado/
│   │       ├── Fuerza/
│   │       └── Comunicaciones/
│   ├── Especificaciones/
│   │   ├── Especificaciones Técnicas/
│   │   ├── Especificaciones de Materiales/
│   │   └── Especificaciones de Calidad/
│   ├── Memorias/
│   │   ├── Memoria de Cálculo/
│   │   ├── Memoria Descriptiva/
│   │   └── Memoria de Costos/
│   └── Renderizados/
│       ├── Exteriores/
│       ├── Interiores/
│       └── Maquetas 3D/
└── [Other folders...]
*/

-- Test queries to verify the structure:

-- 1. Check if etapa tipo folders were created correctly
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  c.s3_path,
  c.carpeta_padre_id,
  c.etapa_tipo_id,
  c.orden_visualizacion
FROM carpetas c
JOIN proyectos p ON c.proyecto_id = p.id
WHERE p.nombre = 'Proyecto de Diseño Complejo'
AND c.etapa_tipo_id IS NOT NULL
ORDER BY c.orden_visualizacion;

-- 2. Check the hierarchy of nested folders
WITH RECURSIVE folder_hierarchy AS (
  SELECT 
    id, nombre, carpeta_padre_id, s3_path, 0 as level
  FROM carpetas 
  WHERE proyecto_id = (SELECT id FROM proyectos WHERE nombre = 'Proyecto de Diseño Complejo')
  AND carpeta_padre_id IS NULL
  
  UNION ALL
  
  SELECT 
    c.id, c.nombre, c.carpeta_padre_id, c.s3_path, fh.level + 1
  FROM carpetas c
  JOIN folder_hierarchy fh ON c.carpeta_padre_id = fh.id
)
SELECT 
  level,
  REPEAT('  ', level) || nombre as folder_tree,
  s3_path
FROM folder_hierarchy
ORDER BY s3_path; 