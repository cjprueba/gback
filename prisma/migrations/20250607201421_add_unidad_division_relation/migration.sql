-- DropForeignKey
ALTER TABLE "unidades" DROP CONSTRAINT "unidades_departamento_id_fkey";

-- AlterTable
ALTER TABLE "unidades" ADD COLUMN     "division_id" INTEGER,
ALTER COLUMN "departamento_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
