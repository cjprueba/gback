-- Ejemplo de registros en la tabla carpetas después de crear un proyecto
-- Este script muestra cómo se verían los registros en la base de datos

-- Proyecto creado: "Proyecto de Diseño" con ID 123
-- Usuario creador: ID 1
-- Etapa tipo: "Diseño" con carpetas_iniciales configuradas

-- 1. Carpeta raíz del proyecto
INSERT INTO carpetas (
  id, nombre, descripcion, proyecto_id, s3_path, s3_bucket_name, 
  s3_created, orden_visualizacion, usuario_creador, activa
) VALUES (
  1, 'Proyecto de Diseño', 'Carpeta raíz del proyecto: Proyecto de Diseño', 
  123, 'proyectos/proyecto_de_diseno_123', 'gestor-files', 
  true, 0, 1, true
);

-- 2. Carpetas iniciales (desde carpeta_inicial)
INSERT INTO carpetas (
  id, nombre, descripcion, proyecto_id, carpeta_padre_id, s3_path, 
  s3_bucket_name, s3_created, orden_visualizacion, usuario_creador, activa
) VALUES 
(2, 'General', 'Carpeta inicial del proyecto', 123, 1, 'proyectos/proyecto_de_diseno_123/General', 'gestor-files', true, 1, 1, true);

-- 3. Carpetas del tipo de etapa (desde etapas_tipo.carpetas_iniciales)
INSERT INTO carpetas (
  id, nombre, descripcion, proyecto_id, carpeta_padre_id, s3_path, 
  s3_bucket_name, s3_created, orden_visualizacion, usuario_creador, activa
) VALUES 
(3, 'Diseños', 'Carpeta del tipo de etapa', 123, 1, 'proyectos/proyecto_de_diseno_123/Diseños', 'gestor-files', true, 2, 1, true),
(4, 'Planos de Diseño', 'Carpeta del tipo de etapa', 123, 1, 'proyectos/proyecto_de_diseno_123/Planos de Diseño', 'gestor-files', true, 3, 1, true),
(5, 'Especificaciones', 'Carpeta del tipo de etapa', 123, 1, 'proyectos/proyecto_de_diseno_123/Especificaciones', 'gestor-files', true, 4, 1, true),
(6, 'Memorias de Cálculo', 'Carpeta del tipo de etapa', 123, 1, 'proyectos/proyecto_de_diseno_123/Memorias de Cálculo', 'gestor-files', true, 5, 1, true),
(7, 'Renderizados', 'Carpeta del tipo de etapa', 123, 1, 'proyectos/proyecto_de_diseno_123/Renderizados', 'gestor-files', true, 6, 1, true);

-- Actualizar el proyecto con la carpeta raíz
UPDATE proyectos SET carpeta_raiz_id = 1 WHERE id = 123;

-- Consulta para ver la estructura de carpetas del proyecto
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  c.s3_path,
  c.orden_visualizacion,
  c.carpeta_padre_id,
  p.nombre as proyecto_nombre,
  u.nombre_completo as creador
FROM carpetas c
LEFT JOIN proyectos p ON c.proyecto_id = p.id
LEFT JOIN usuarios u ON c.usuario_creador = u.id
WHERE c.proyecto_id = 123
ORDER BY c.orden_visualizacion;

-- Consulta para ver la jerarquía de carpetas
WITH RECURSIVE carpeta_hierarchy AS (
  -- Carpetas raíz (sin padre)
  SELECT 
    id, nombre, descripcion, carpeta_padre_id, s3_path, orden_visualizacion,
    0 as nivel,
    nombre as ruta_completa
  FROM carpetas 
  WHERE proyecto_id = 123 AND carpeta_padre_id IS NULL
  
  UNION ALL
  
  -- Carpetas hijas
  SELECT 
    c.id, c.nombre, c.descripcion, c.carpeta_padre_id, c.s3_path, c.orden_visualizacion,
    ch.nivel + 1,
    ch.ruta_completa || ' > ' || c.nombre
  FROM carpetas c
  INNER JOIN carpeta_hierarchy ch ON c.carpeta_padre_id = ch.id
  WHERE c.proyecto_id = 123
)
SELECT 
  nivel,
  nombre,
  descripcion,
  s3_path,
  ruta_completa
FROM carpeta_hierarchy
ORDER BY ruta_completa; 