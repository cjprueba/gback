/*
  Warnings:

  - You are about to drop the column `archivo_relacionado` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `hash_integridad` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `s3_bucket_name` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `s3_created` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `s3_path` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `tamano` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `documentos` table. All the data in the column will be lost.
  - Changed the type of `numero_version` on the `documento_versiones` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."documentos" DROP CONSTRAINT "documentos_archivo_relacionado_fkey";

-- AlterTable
ALTER TABLE "public"."documento_versiones" DROP COLUMN "numero_version",
ADD COLUMN     "numero_version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."documentos" DROP COLUMN "archivo_relacionado",
DROP COLUMN "hash_integridad",
DROP COLUMN "metadata",
DROP COLUMN "s3_bucket_name",
DROP COLUMN "s3_created",
DROP COLUMN "s3_path",
DROP COLUMN "tamano",
DROP COLUMN "version";

-- CreateIndex
CREATE UNIQUE INDEX "documento_versiones_documento_id_numero_version_key" ON "public"."documento_versiones"("documento_id", "numero_version");
