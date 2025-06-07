/*
  Warnings:

  - You are about to drop the column `username` on the `usuarios` table. All the data in the column will be lost.
  - You are about to alter the column `correo_electronico` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - Made the column `nombre_completo` on table `usuarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correo_electronico` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "usuarios_username_key";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "username",
ALTER COLUMN "nombre_completo" SET NOT NULL,
ALTER COLUMN "correo_electronico" SET NOT NULL,
ALTER COLUMN "correo_electronico" SET DATA TYPE VARCHAR(50);
