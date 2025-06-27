/*
  Warnings:

  - Made the column `isAgencyTrip` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "isAgencyTrip" SET NOT NULL;
