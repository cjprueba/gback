-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "s3_bucket_name" VARCHAR(100),
ADD COLUMN     "s3_created" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "s3_path" VARCHAR(500);
