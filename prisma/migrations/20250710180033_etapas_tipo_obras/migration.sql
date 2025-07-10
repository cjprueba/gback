-- CreateTable
CREATE TABLE "etapas_tipo_obras" (
    "id" SERIAL NOT NULL,
    "etapa_tipo_id" INTEGER NOT NULL,
    "tipo_obra_id" INTEGER NOT NULL,

    CONSTRAINT "etapas_tipo_obras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "etapas_tipo_obras" ADD CONSTRAINT "etapas_tipo_obras_etapa_tipo_id_fkey" FOREIGN KEY ("etapa_tipo_id") REFERENCES "etapas_tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_tipo_obras" ADD CONSTRAINT "etapas_tipo_obras_tipo_obra_id_fkey" FOREIGN KEY ("tipo_obra_id") REFERENCES "tipos_obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
