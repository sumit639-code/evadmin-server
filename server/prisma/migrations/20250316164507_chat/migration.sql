-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "adminApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
