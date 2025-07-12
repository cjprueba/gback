/*
  Warnings:

  - You are about to drop the column `ruta_fisica` on the `carpetas` table. All the data in the column will be lost.
  - Added the required column `s3_path` to the `carpetas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "carpetas" DROP COLUMN "ruta_fisica",
ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "permisos_escritura" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "permisos_lectura" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "s3_bucket_name" VARCHAR(100),
ADD COLUMN     "s3_created" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "s3_path" VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "carpeta_raiz_id" INTEGER,
ADD COLUMN     "s3_bucket_name" VARCHAR(100),
ADD COLUMN     "s3_folder_created" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "s3_root_path" VARCHAR(500);

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_carpeta_raiz_id_fkey" FOREIGN KEY ("carpeta_raiz_id") REFERENCES "carpetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
