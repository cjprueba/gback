/*
  Warnings:

  - You are about to drop the column `concesion_id` on the `carpetas` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_id` on the `carpetas` table. All the data in the column will be lost.
  - You are about to drop the column `division_id` on the `carpetas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "carpetas" DROP CONSTRAINT "carpetas_concesion_id_fkey";

-- DropForeignKey
ALTER TABLE "carpetas" DROP CONSTRAINT "carpetas_departamento_id_fkey";

-- DropForeignKey
ALTER TABLE "carpetas" DROP CONSTRAINT "carpetas_division_id_fkey";

-- AlterTable
ALTER TABLE "carpetas" DROP COLUMN "concesion_id",
DROP COLUMN "departamento_id",
DROP COLUMN "division_id";
