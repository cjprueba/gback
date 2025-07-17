-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "tipo_documento_id" INTEGER;

-- CreateTable
CREATE TABLE "tipos_documentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "requiere_nro_pro_exp" BOOLEAN NOT NULL DEFAULT false,
    "requiere_saf_exp" BOOLEAN NOT NULL DEFAULT false,
    "requiere_numerar" BOOLEAN NOT NULL DEFAULT false,
    "requiere_tramitar" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_documentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
