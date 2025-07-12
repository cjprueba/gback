/*
  Warnings:

  - You are about to drop the column `etapa_registro_id` on the `proyectos` table. All the data in the column will be lost.
  - Added the required column `proyecto_id` to the `etapas_registro` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "proyectos" DROP CONSTRAINT "proyectos_etapa_registro_id_fkey";

-- AlterTable: Add proyecto_id as nullable first
ALTER TABLE "etapas_registro" ADD COLUMN "proyecto_id" INTEGER;

-- Copy data from the existing relationship
UPDATE "etapas_registro" 
SET "proyecto_id" = (
    SELECT "id" 
    FROM "proyectos" 
    WHERE "proyectos"."etapa_registro_id" = "etapas_registro"."id"
);

-- Make proyecto_id NOT NULL
ALTER TABLE "etapas_registro" ALTER COLUMN "proyecto_id" SET NOT NULL;

-- AlterTable: Drop etapa_registro_id from proyectos
ALTER TABLE "proyectos" DROP COLUMN "etapa_registro_id";

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
