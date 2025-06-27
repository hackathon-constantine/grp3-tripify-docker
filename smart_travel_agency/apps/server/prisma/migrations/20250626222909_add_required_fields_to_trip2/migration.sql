/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itinaries` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itineraries` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- First create a transaction to ensure all operations succeed or fail together
BEGIN;

-- Step 1: Add columns as nullable first
ALTER TABLE "Trip" ADD COLUMN "creatorId" TEXT;
ALTER TABLE "Trip" ADD COLUMN "isAgencyTrip" BOOLEAN DEFAULT false;
ALTER TABLE "Trip" ADD COLUMN "itinaries" JSONB;
ALTER TABLE "User" ADD COLUMN "itineraries" JSONB;

-- Step 2: Set default values for existing records
-- Find an admin user to set as creator for existing trips
DO $$
DECLARE
    admin_id TEXT;
BEGIN
    -- Try to find an admin user
    SELECT id INTO admin_id FROM "User" WHERE role = 'Admin' LIMIT 1;
    
    -- If no admin found, use the first user
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM "User" LIMIT 1;
    END IF;
    
    -- Update existing trips with default values
    UPDATE "Trip" 
    SET 
        "creatorId" = admin_id,
        "isAgencyTrip" = true,
        "itinaries" = '{"default": "Default itinerary data"}'::JSONB;
        
    -- Update existing users with default values
    UPDATE "User"
    SET "itineraries" = '[]'::JSONB;
END $$;

-- Step 3: Make columns NOT NULL after setting defaults
ALTER TABLE "Trip" ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE "Trip" ALTER COLUMN "itinaries" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "itineraries" SET NOT NULL;

-- Step 4: Drop related tables and constraints
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_itineraryId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_tripId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_userId_fkey";
ALTER TABLE "Itinerary" DROP CONSTRAINT IF EXISTS "Itinerary_userId_fkey";

-- Step 5: Drop tables
DROP TABLE IF EXISTS "Booking";
DROP TABLE IF EXISTS "Itinerary";

-- Step 6: Add foreign key constraint
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_creatorId_fkey" 
FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Commit the transaction
COMMIT;
