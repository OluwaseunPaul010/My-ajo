-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bvn" TEXT,
ADD COLUMN     "bvnVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerifyToken" TEXT,
ADD COLUMN     "kycStatus" TEXT NOT NULL DEFAULT 'unverified',
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nin" TEXT,
ADD COLUMN     "ninVerified" BOOLEAN NOT NULL DEFAULT false;
