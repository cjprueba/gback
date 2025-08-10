/*
  Warnings:

  - You are about to drop the `etapas_comunas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etapas_provincias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etapas_regiones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."etapas_comunas" DROP CONSTRAINT "etapas_comunas_comuna_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_comunas" DROP CONSTRAINT "etapas_comunas_etapa_registro_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_provincias" DROP CONSTRAINT "etapas_provincias_etapa_registro_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_provincias" DROP CONSTRAINT "etapas_provincias_provincia_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_regiones" DROP CONSTRAINT "etapas_regiones_etapa_registro_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_regiones" DROP CONSTRAINT "etapas_regiones_region_id_fkey";

-- DropTable
DROP TABLE "public"."etapas_comunas";

-- DropTable
DROP TABLE "public"."etapas_provincias";

-- DropTable
DROP TABLE "public"."etapas_regiones";

-- CreateTable
CREATE TABLE "public"."etapas_geografia" (
    "id" SERIAL NOT NULL,
    "etapa_registro_id" INTEGER NOT NULL,
    "tipo_geografia" TEXT NOT NULL,
    "region_id" INTEGER,
    "provincia_id" INTEGER,
    "comuna_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_geografia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etapas_geografia_etapa_registro_id_tipo_geografia_region_id_key" ON "public"."etapas_geografia"("etapa_registro_id", "tipo_geografia", "region_id", "provincia_id", "comuna_id");

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "public"."etapas_registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "public"."provincias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_comuna_id_fkey" FOREIGN KEY ("comuna_id") REFERENCES "public"."comunas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
