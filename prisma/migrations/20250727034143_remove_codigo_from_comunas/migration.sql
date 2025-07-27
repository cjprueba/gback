/*
  Warnings:

  - You are about to drop the column `codigo` on the `comunas` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "comunas_codigo_key";

-- AlterTable
ALTER TABLE "comunas" DROP COLUMN "codigo";
