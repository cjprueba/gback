/*
  Warnings:

  - You are about to drop the column `tipo_geografia` on the `etapas_geografia` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[etapa_registro_id,region_id,provincia_id,comuna_id]` on the table `etapas_geografia` will be added. If there are existing duplicate values, this will fail.
  - Made the column `region_id` on table `etapas_geografia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `provincia_id` on table `etapas_geografia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comuna_id` on table `etapas_geografia` required. This step will fail if there are existing NULL values in that column.

*/

-- Clean up existing data that doesn't conform to the new structure
-- Delete records where any of the required columns are NULL
DELETE FROM "public"."etapas_geografia" 
WHERE "region_id" IS NULL 
   OR "provincia_id" IS NULL 
   OR "comuna_id" IS NULL;

-- DropForeignKey
ALTER TABLE "public"."etapas_geografia" DROP CONSTRAINT "etapas_geografia_comuna_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_geografia" DROP CONSTRAINT "etapas_geografia_provincia_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etapas_geografia" DROP CONSTRAINT "etapas_geografia_region_id_fkey";

-- DropIndex
DROP INDEX "public"."etapas_geografia_etapa_registro_id_tipo_geografia_region_id_key";

-- AlterTable
ALTER TABLE "public"."etapas_geografia" DROP COLUMN "tipo_geografia",
ALTER COLUMN "region_id" SET NOT NULL,
ALTER COLUMN "provincia_id" SET NOT NULL,
ALTER COLUMN "comuna_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "etapas_geografia_etapa_registro_id_region_id_provincia_id_c_key" ON "public"."etapas_geografia"("etapa_registro_id", "region_id", "provincia_id", "comuna_id");

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "public"."provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etapas_geografia" ADD CONSTRAINT "etapas_geografia_comuna_id_fkey" FOREIGN KEY ("comuna_id") REFERENCES "public"."comunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
