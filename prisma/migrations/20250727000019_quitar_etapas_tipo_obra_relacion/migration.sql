/*
  Warnings:

  - You are about to drop the `etapas_tipo_obras` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "etapas_tipo_obras" DROP CONSTRAINT "etapas_tipo_obras_etapa_tipo_id_fkey";

-- DropForeignKey
ALTER TABLE "etapas_tipo_obras" DROP CONSTRAINT "etapas_tipo_obras_tipo_obra_id_fkey";

-- DropTable
DROP TABLE "etapas_tipo_obras";
