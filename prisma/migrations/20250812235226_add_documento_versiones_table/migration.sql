-- CreateTable
CREATE TABLE "public"."documento_versiones" (
    "id" SERIAL NOT NULL,
    "documento_id" UUID NOT NULL,
    "numero_version" VARCHAR(20) NOT NULL,
    "s3_path" VARCHAR(500) NOT NULL,
    "s3_bucket_name" VARCHAR(100),
    "tamano" BIGINT,
    "hash_integridad" VARCHAR(255),
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_creador" INTEGER NOT NULL,
    "metadata" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "documento_versiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documento_versiones_documento_id_idx" ON "public"."documento_versiones"("documento_id");

-- CreateIndex
CREATE INDEX "documento_versiones_fecha_creacion_idx" ON "public"."documento_versiones"("fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "documento_versiones_documento_id_numero_version_key" ON "public"."documento_versiones"("documento_id", "numero_version");

-- AddForeignKey
ALTER TABLE "public"."documento_versiones" ADD CONSTRAINT "documento_versiones_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documento_versiones" ADD CONSTRAINT "documento_versiones_usuario_creador_fkey" FOREIGN KEY ("usuario_creador") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
