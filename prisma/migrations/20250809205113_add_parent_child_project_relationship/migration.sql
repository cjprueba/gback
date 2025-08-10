-- AlterTable
ALTER TABLE "public"."proyectos" ADD COLUMN     "es_proyecto_padre" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proyecto_padre_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."proyectos" ADD CONSTRAINT "proyectos_proyecto_padre_id_fkey" FOREIGN KEY ("proyecto_padre_id") REFERENCES "public"."proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
