-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultMontoSubtotal" DOUBLE PRECISION,
ADD COLUMN     "receiptNextNumber" INTEGER;

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "montoSubtotal" DOUBLE PRECISION NOT NULL,
    "fecha" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Receipt_userId_anio_idx" ON "Receipt"("userId", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_userId_anio_mes_key" ON "Receipt"("userId", "anio", "mes");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
