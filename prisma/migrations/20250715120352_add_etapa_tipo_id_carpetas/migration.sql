/*
  Warnings:

  - You are about to drop the column `etapa_id` on the `carpetas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "carpetas" DROP CONSTRAINT "carpetas_etapa_id_fkey";

-- AlterTable
ALTER TABLE "carpetas" DROP COLUMN "etapa_id",
ADD COLUMN     "etapa_tipo_id" INTEGER;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_etapa_tipo_id_fkey" FOREIGN KEY ("etapa_tipo_id") REFERENCES "etapas_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
