-- CreateEnum
CREATE TYPE "PackSize" AS ENUM ('CUP', 'BULK2', 'BULK4');

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "pack" "PackSize" NOT NULL DEFAULT 'CUP';
