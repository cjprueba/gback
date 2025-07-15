-- AlterTable
ALTER TABLE "carpetas" ADD COLUMN     "etapa_id" INTEGER;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_etapa_id_fkey" FOREIGN KEY ("etapa_id") REFERENCES "etapas_registro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
