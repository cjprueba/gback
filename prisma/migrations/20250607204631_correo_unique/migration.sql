/*
  Warnings:

  - A unique constraint covering the columns `[correo_electronico]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");
