-- AlterTable
ALTER TABLE "etapas_registro" ADD COLUMN     "bip" TEXT;

-- AlterTable
ALTER TABLE "etapas_tipo" ADD COLUMN     "bip" BOOLEAN NOT NULL DEFAULT true;
