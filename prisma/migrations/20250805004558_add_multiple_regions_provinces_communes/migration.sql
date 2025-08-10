/*
  Warnings:

  - You are about to drop the column `comuna_id` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `provincia_id` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `region_id` on the `etapas_registro` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."etapas_registro" DROP CONSTRAINT "etapas_registro_comuna_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_registro" DROP CONSTRAINT "etapas_registro_provincia_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_registro" DROP CONSTRAINT "etapas_registro_region_id_fkey";

-- AlterTable
ALTER TABLE "public"."etapas_registro" DROP COLUMN "comuna_id",
DROP COLUMN "provincia_id",
DROP COLUMN "region_id";

-- CreateTable
CREATE TABLE "public"."etapas_regiones" (
    "id" SERIAL NOT NULL,
    "etapa_registro_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_regiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."etapas_provincias" (
    "id" SERIAL NOT NULL,
    "etapa_registro_id" INTEGER NOT NULL,
    "provincia_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."etapas_comunas" (
    "id" SERIAL NOT NULL,
    "etapa_registro_id" INTEGER NOT NULL,
    "comuna_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_comunas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etapas_regiones_etapa_registro_id_region_id_key" ON "public"."etapas_regiones"("etapa_registro_id", "region_id");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_provincias_etapa_registro_id_provincia_id_key" ON "public"."etapas_provincias"("etapa_registro_id", "provincia_id");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_comunas_etapa_registro_id_comuna_id_key" ON "public"."etapas_comunas"("etapa_registro_id", "comuna_id");

-- AddForeignKey
ALTER TABLE "public"."etapas_regiones" ADD CONSTRAINT "etapas_regiones_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "public"."etapas_registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_regiones" ADD CONSTRAINT "etapas_regiones_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_provincias" ADD CONSTRAINT "etapas_provincias_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "public"."etapas_registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_provincias" ADD CONSTRAINT "etapas_provincias_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "public"."provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_comunas" ADD CONSTRAINT "etapas_comunas_etapa_registro_id_fkey" FOREIGN KEY ("etapa_registro_id") REFERENCES "public"."etapas_registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_comunas" ADD CONSTRAINT "etapas_comunas_comuna_id_fkey" FOREIGN KEY ("comuna_id") REFERENCES "public"."comunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
