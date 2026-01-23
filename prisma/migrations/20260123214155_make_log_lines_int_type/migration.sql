/*
  Warnings:

  - The `line` column on the `LogEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "line",
ADD COLUMN     "line" INTEGER;
