/*
  Warnings:

  - You are about to drop the column `plazo_total_meses` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `plazo_total_meses` on the `etapas_tipo` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `proyectos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `proyectos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_termino` on the `proyectos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etapas_registro" DROP COLUMN "plazo_total_meses",
ADD COLUMN     "plazo_total_concesion" TEXT;

-- AlterTable
ALTER TABLE "etapas_tipo" DROP COLUMN "plazo_total_meses",
ADD COLUMN     "plazo_total_concesion" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "proyectos" DROP COLUMN "estado",
DROP COLUMN "fecha_inicio",
DROP COLUMN "fecha_termino";
