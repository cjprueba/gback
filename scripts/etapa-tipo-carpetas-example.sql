-- Ejemplo de cómo configurar carpetas_iniciales en la tabla etapas_tipo
-- Este script muestra diferentes estructuras JSON que se pueden usar

-- Estructura 1: Array de objetos
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Documentos"},
  {"nombre": "Planos"},
  {"nombre": "Fotos"},
  {"nombre": "Contratos"},
  {"nombre": "Estudios"}
]'
WHERE id = 1;

-- Estructura 2: Objeto con array carpetas
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
WHERE id = 2;

-- Estructura 3: Objeto con nombres de carpetas como claves
UPDATE etapas_tipo 
SET carpetas_iniciales = '{
  "Documentos": {},
  "Planos": {},
  "Fotos": {},
  "Contratos": {},
  "Estudios": {}
}'
WHERE id = 3;

-- Ejemplo para una etapa tipo específica (ej: "Diseño")
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Diseños"},
  {"nombre": "Planos de Diseño"},
  {"nombre": "Especificaciones"},
  {"nombre": "Memorias de Cálculo"},
  {"nombre": "Renderizados"}
]'
WHERE nombre = 'Diseño';

-- Ejemplo para una etapa tipo específica (ej: "Construcción")
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Obras"},
  {"nombre": "Planos de Construcción"},
  {"nombre": "Fotografías de Avance"},
  {"nombre": "Control de Calidad"},
  {"nombre": "Seguridad"}
]'
WHERE nombre = 'Construcción';

-- Ejemplo para una etapa tipo específica (ej: "Licitación")
UPDATE etapas_tipo 
SET carpetas_iniciales = '[
  {"nombre": "Bases de Licitación"},
  {"nombre": "Pliegos"},
  {"nombre": "Ofertas"},
  {"nombre": "Evaluaciones"},
  {"nombre": "Adjudicaciones"}
]'
WHERE nombre = 'Licitación';

-- Consulta para ver las carpetas_iniciales configuradas
SELECT 
  id,
  nombre,
  carpetas_iniciales
FROM etapas_tipo 
WHERE carpetas_iniciales IS NOT NULL 
  AND carpetas_iniciales != '{}'; 