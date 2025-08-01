-- Agregar campo eliminado a la tabla proyectos para soft delete
ALTER TABLE proyectos ADD COLUMN eliminado BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento de las consultas que filtran por eliminado
CREATE INDEX idx_proyectos_eliminado ON proyectos(eliminado); 