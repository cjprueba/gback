/*
  Warnings:

  - You are about to drop the column `valor_referencia` on the `proyectos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etapas_registro" ADD COLUMN     "valor_referencia" VARCHAR(255);

-- AlterTable
ALTER TABLE "etapas_tipo" ADD COLUMN     "valor_referencia" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "proyectos" DROP COLUMN "valor_referencia";
