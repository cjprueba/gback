/*
  Warnings:

  - You are about to drop the column `username` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo_electronico]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "usuarios_username_key";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "username";

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");
