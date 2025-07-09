/*
  Warnings:

  - You are about to drop the column `comuna` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_iniciativa` on the `etapas_registro` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_obra` on the `etapas_registro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etapas_registro" DROP COLUMN "comuna",
DROP COLUMN "provincia",
DROP COLUMN "region",
DROP COLUMN "tipo_iniciativa",
DROP COLUMN "tipo_obra",
ADD COLUMN     "comuna_id" INTEGER,
ADD COLUMN     "provincia_id" INTEGER,
ADD COLUMN     "region_id" INTEGER,
ADD COLUMN     "tipo_iniciativa_id" INTEGER,
ADD COLUMN     "tipo_obra_id" INTEGER,
ALTER COLUMN "presupuesto_oficial" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "tipos_iniciativas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_iniciativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_obras" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiones" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(5) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "nombre_corto" VARCHAR(50),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(5) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "region_id" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(5) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "provincia_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regiones_codigo_key" ON "regiones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "provincias_codigo_key" ON "provincias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "comunas_codigo_key" ON "comunas"("codigo");

-- AddForeignKey
ALTER TABLE "provincias" ADD CONSTRAINT "provincias_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunas" ADD CONSTRAINT "comunas_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunas" ADD CONSTRAINT "comunas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_tipo_iniciativa_id_fkey" FOREIGN KEY ("tipo_iniciativa_id") REFERENCES "tipos_iniciativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_tipo_obra_id_fkey" FOREIGN KEY ("tipo_obra_id") REFERENCES "tipos_obras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_registro" ADD CONSTRAINT "etapas_registro_comuna_id_fkey" FOREIGN KEY ("comuna_id") REFERENCES "comunas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
