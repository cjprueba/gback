/*
  Warnings:

  - Added the required column `division_id` to the `unidades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "unidades" ADD COLUMN     "division_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
