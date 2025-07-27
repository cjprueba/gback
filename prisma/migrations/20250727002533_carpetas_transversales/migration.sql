-- CreateTable
CREATE TABLE "carpetas_transversales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(20) NOT NULL,
    "orden" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "etapa_tipo_id" INTEGER,

    CONSTRAINT "carpetas_transversales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "carpetas_transversales" ADD CONSTRAINT "carpetas_transversales_etapa_tipo_id_fkey" FOREIGN KEY ("etapa_tipo_id") REFERENCES "etapas_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
