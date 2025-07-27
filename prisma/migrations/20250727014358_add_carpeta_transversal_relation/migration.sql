-- AlterTable
ALTER TABLE "carpetas" ADD COLUMN     "carpeta_transversal_id" INTEGER;

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_carpeta_transversal_id_fkey" FOREIGN KEY ("carpeta_transversal_id") REFERENCES "carpetas_transversales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
