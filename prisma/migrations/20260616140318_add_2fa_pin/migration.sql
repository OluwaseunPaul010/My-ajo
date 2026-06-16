-- AlterTable
ALTER TABLE "User" ADD COLUMN     "transactionPin" TEXT,
ADD COLUMN     "twoFactorCode" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorExpiry" TIMESTAMP(3);
