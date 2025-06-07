/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "perfiles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisiones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "division_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "departamento_id" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "nombre_completo" VARCHAR(100),
    "correo_electronico" VARCHAR(100),
    "perfil_id" INTEGER NOT NULL,
    "division_id" INTEGER,
    "departamento_id" INTEGER,
    "unidad_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "codigo_proyecto" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(50),
    "fecha_inicio" DATE,
    "fecha_termino" DATE,
    "division_id" INTEGER,
    "departamento_id" INTEGER,
    "unidad_id" INTEGER,
    "creado_por" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" SERIAL NOT NULL,
    "codigo_contrato" VARCHAR(50) NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fecha_firma" DATE,
    "fecha_vencimiento" DATE,
    "monto" DECIMAL(18,2),
    "estado" VARCHAR(30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concesiones" (
    "id" SERIAL NOT NULL,
    "codigo_concesion" VARCHAR(50) NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(30),
    "fecha_inicio" DATE,
    "fecha_termino" DATE,
    "tipo_obra" VARCHAR(100),
    "ubicacion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obras_concesionadas" (
    "id" SERIAL NOT NULL,
    "concesion_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "tipo_obra" VARCHAR(100),
    "estado" VARCHAR(30),
    "fecha_inicio" DATE,
    "fecha_termino" DATE,
    "ubicacion" VARCHAR(255),
    "presupuesto" DECIMAL(18,2),

    CONSTRAINT "obras_concesionadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "nombre_fantasia" VARCHAR(255),
    "direccion" TEXT,
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "representante_legal" VARCHAR(255),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asesores" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "especialidad" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "externos_involucrados" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "asesor_id" INTEGER,
    "tipo_participacion" VARCHAR(50),
    "rol" VARCHAR(100),
    "fecha_inicio" DATE,
    "fecha_termino" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "externos_involucrados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fechas_clave" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER,
    "contrato_id" INTEGER,
    "concesion_id" INTEGER,
    "tipo_fecha" VARCHAR(50),
    "fecha_programada" DATE,
    "fecha_real" DATE,
    "descripcion" TEXT,
    "es_hito_critico" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fechas_clave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspector_fiscal" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_asignacion" DATE,
    "fecha_termino" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,

    CONSTRAINT "inspector_fiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hitos_contractuales" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fecha_comprometida" DATE,
    "fecha_cumplimiento" DATE,
    "cumplido" BOOLEAN NOT NULL DEFAULT false,
    "alerta_30" BOOLEAN NOT NULL DEFAULT false,
    "alerta_15" BOOLEAN NOT NULL DEFAULT false,
    "alerta_5" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hitos_contractuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(10),
    "tamano" BIGINT,
    "tipo_mime" VARCHAR(100),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_creador" INTEGER NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(100),
    "estado" VARCHAR(30),
    "version" VARCHAR(10),
    "archivo_relacionado" TEXT,
    "ruta_storage" TEXT,
    "hash_integridad" VARCHAR(255),
    "etiquetas" TEXT[],
    "fecha_ultima_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contrato_id" INTEGER,
    "proyecto_id" INTEGER,
    "subido_por" INTEGER NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivo_historial" (
    "id" SERIAL NOT NULL,
    "archivo_id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" VARCHAR(50),
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version_anterior" TEXT,
    "version_nueva" TEXT,

    CONSTRAINT "archivo_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" VARCHAR(100),
    "entidad" VARCHAR(50),
    "entidad_id" INTEGER,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "proyectos_codigo_proyecto_key" ON "proyectos"("codigo_proyecto");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_codigo_contrato_key" ON "contratos"("codigo_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "concesiones_codigo_concesion_key" ON "concesiones"("codigo_concesion");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rut_key" ON "empresas"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "asesores_rut_key" ON "asesores"("rut");

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concesiones" ADD CONSTRAINT "concesiones_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras_concesionadas" ADD CONSTRAINT "obras_concesionadas_concesion_id_fkey" FOREIGN KEY ("concesion_id") REFERENCES "concesiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externos_involucrados" ADD CONSTRAINT "externos_involucrados_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externos_involucrados" ADD CONSTRAINT "externos_involucrados_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externos_involucrados" ADD CONSTRAINT "externos_involucrados_asesor_id_fkey" FOREIGN KEY ("asesor_id") REFERENCES "asesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fechas_clave" ADD CONSTRAINT "fechas_clave_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fechas_clave" ADD CONSTRAINT "fechas_clave_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fechas_clave" ADD CONSTRAINT "fechas_clave_concesion_id_fkey" FOREIGN KEY ("concesion_id") REFERENCES "concesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspector_fiscal" ADD CONSTRAINT "inspector_fiscal_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspector_fiscal" ADD CONSTRAINT "inspector_fiscal_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hitos_contractuales" ADD CONSTRAINT "hitos_contractuales_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_usuario_creador_fkey" FOREIGN KEY ("usuario_creador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_archivo_relacionado_fkey" FOREIGN KEY ("archivo_relacionado") REFERENCES "documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo_historial" ADD CONSTRAINT "archivo_historial_archivo_id_fkey" FOREIGN KEY ("archivo_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo_historial" ADD CONSTRAINT "archivo_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
