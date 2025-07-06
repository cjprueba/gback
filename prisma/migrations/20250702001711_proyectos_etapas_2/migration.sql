/*
  Warnings:

  - The primary key for the `documentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contrato_id` on the `documentos` table. All the data in the column will be lost.
  - The `archivo_relacionado` column on the `documentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `contrato_id` on the `fechas_clave` table. All the data in the column will be lost.
  - You are about to drop the column `division_id` on the `unidades` table. All the data in the column will be lost.
  - You are about to drop the `contratos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hitos_contractuales` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `archivo_id` on the `archivo_historial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `accion` on table `archivo_historial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accion` on table `auditorias` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entidad` on table `auditorias` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entidad_id` on table `auditorias` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `carpeta_id` to the `documentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `documentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `tipo_participacion` on table `externos_involucrados` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rol` on table `externos_involucrados` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo_fecha` on table `fechas_clave` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `etapa_registro_id` to the `proyectos` table without a default value. This is not possible if the table is not empty.
  - Made the column `departamento_id` on table `unidades` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `username` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "archivo_historial" DROP CONSTRAINT "archivo_historial_archivo_id_fkey";

-- DropForeignKey
ALTER TABLE "contratos" DROP CONSTRAINT "contratos_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_archivo_relacionado_fkey";

-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "fechas_clave" DROP CONSTRAINT "fechas_clave_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "hitos_contractuales" DROP CONSTRAINT "hitos_contractuales_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "unidades" DROP CONSTRAINT "unidades_departamento_id_fkey";

-- DropForeignKey
ALTER TABLE "unidades" DROP CONSTRAINT "unidades_division_id_fkey";

-- DropIndex
DROP INDEX "usuarios_correo_electronico_key";

-- AlterTable
ALTER TABLE "archivo_historial" DROP COLUMN "archivo_id",
ADD COLUMN     "archivo_id" UUID NOT NULL,
ALTER COLUMN "accion" SET NOT NULL;

-- AlterTable
ALTER TABLE "auditorias" ALTER COLUMN "accion" SET NOT NULL,
ALTER COLUMN "entidad" SET NOT NULL,
ALTER COLUMN "entidad_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_pkey",
DROP COLUMN "contrato_id",
ADD COLUMN     "carpeta_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "archivo_relacionado",
ADD COLUMN     "archivo_relacionado" UUID,
ADD CONSTRAINT "documentos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "externos_involucrados" ALTER COLUMN "tipo_participacion" SET NOT NULL,
ALTER COLUMN "rol" SET NOT NULL;

-- AlterTable
ALTER TABLE "fechas_clave" DROP COLUMN "contrato_id",
ALTER COLUMN "tipo_fecha" SET NOT NULL;

-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "carpeta_inicial" JSONB,
ADD COLUMN     "etapa_registro_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "unidades" DROP COLUMN "division_id",
ALTER COLUMN "departamento_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "username" VARCHAR(50) NOT NULL,
ALTER COLUMN "nombre_completo" DROP NOT NULL,
ALTER COLUMN "correo_electronico" DROP NOT NULL,
ALTER COLUMN "correo_electronico" SET DATA TYPE VARCHAR(100);

-- DropTable
DROP TABLE "contratos";

-- DropTable
DROP TABLE "hitos_contractuales";

-- CreateTable
CREATE TABLE "etapas_tipo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "etapas_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas_registro" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "etapa_tipo_id" INTEGER NOT NULL,
    "tipo_iniciativa" VARCHAR(20) NOT NULL,
    "tipo_obra" VARCHAR(100),
    "region" VARCHAR(50),
    "provincia" VARCHAR(50),
    "comuna" VARCHAR(50),
    "volumen" TEXT,
    "presupuesto_oficial" DECIMAL(18,2),
    "fecha_licitacion" DATE,
    "fecha_recepcion_ofertas_tecnicas" DATE,
    "fecha_apertura_ofertas_economicas" DATE,
    "fecha_adjudicacion" DATE,
    "fecha_inicio_concesion" DATE,
    "fecha_puesta_servicio" DATE,
    "plazo_total_meses" INTEGER,
    "decreto_adjudicacion" TEXT,
    "sociedad_concesionaria" VARCHAR(255),
    "inspector_fiscal_id" INTEGER,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'planificada',
    "orden_secuencial" INTEGER NOT NULL DEFAULT 1,
    "es_etapa_critica" BOOLEAN NOT NULL DEFAULT false,
    "permite_solapamiento" BOOLEAN NOT NULL DEFAULT false,
    "documentos_requeridos" TEXT[],
    "carpeta_documentos_id" INTEGER,
    "usuario_creador" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "etapas_registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER,
    "concesion_id" INTEGER,
    "etapa_registro_id" INTEGER,
    "documento_id" UUID,
    "tipo_alerta" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "fecha_alerta" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activa',
    "automatica" BOOLEAN NOT NULL DEFAULT false,
    "usuario_creador" INTEGER NOT NULL,
    "usuario_asignado" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificacion_enviada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_documental" (
    "id" SERIAL NOT NULL,
    "documento_id" UUID NOT NULL,
    "descripcion" TEXT,
    "fecha_comprometida" DATE,
    "fecha_cumplimiento" DATE,
    "cumplido" BOOLEAN NOT NULL DEFAULT false,
    "alerta_30" BOOLEAN NOT NULL DEFAULT false,
    "alerta_15" BOOLEAN NOT NULL DEFAULT false,
    "alerta_5" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "registro_documental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpetas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "carpeta_padre_id" INTEGER,
    "proyecto_id" INTEGER,
    "concesion_id" INTEGER,
    "division_id" INTEGER,
    "departamento_id" INTEGER,
    "ruta_fisica" VARCHAR(500) NOT NULL,
    "orden_visualizacion" INTEGER NOT NULL DEFAULT 0,
    "usuario_creador" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_tamaño_mb" INTEGER,
    "tipos_archivo_permitidos" TEXT[],

    CONSTRAINT "carpetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpetas_auditoria" (
    "id" SERIAL NOT NULL,
    "carpeta_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "detalle_anterior" JSONB,
    "detalle_nuevo" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carpetas_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_etapa_tipo_id_fkey" FOREIGN KEY ("etapa_tipo_id") REFERENCES "etapas_tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_inspector_fiscal_id_fkey" FOREIGN KEY ("inspector_fiscal_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_carpeta_documentos_id_fkey" FOREIGN KEY ("carpeta_documentos_id") REFERENCES "carpetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_usuario_creador_fkey" FOREIGN KEY ("usuario_creador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "etapas_registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_concesion_id_fkey" FOREIGN KEY ("concesion_id") REFERENCES "concesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "etapas_registro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuario_creador_fkey" FOREIGN KEY ("usuario_creador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuario_asignado_fkey" FOREIGN KEY ("usuario_asignado") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_documental" ADD CONSTRAINT "registro_documental_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_carpeta_padre_id_fkey" FOREIGN KEY ("carpeta_padre_id") REFERENCES "carpetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_concesion_id_fkey" FOREIGN KEY ("concesion_id") REFERENCES "concesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_usuario_creador_fkey" FOREIGN KEY ("usuario_creador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_carpeta_id_fkey" FOREIGN KEY ("carpeta_id") REFERENCES "carpetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_archivo_relacionado_fkey" FOREIGN KEY ("archivo_relacionado") REFERENCES "documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas_auditoria" ADD CONSTRAINT "carpetas_auditoria_carpeta_id_fkey" FOREIGN KEY ("carpeta_id") REFERENCES "carpetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas_auditoria" ADD CONSTRAINT "carpetas_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo_historial" ADD CONSTRAINT "archivo_historial_archivo_id_fkey" FOREIGN KEY ("archivo_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
