/*
  Warnings:

  - You are about to drop the column `codigo_proyecto` on the `proyectos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "proyectos_codigo_proyecto_key";

-- AlterTable
ALTER TABLE "etapas_registro" ALTER COLUMN "plazo_total_meses" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "etapas_tipo" ADD COLUMN     "carpetas_iniciales" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "proyectos" DROP COLUMN "codigo_proyecto";
