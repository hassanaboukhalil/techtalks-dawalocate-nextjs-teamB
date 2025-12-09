/*
  Warnings:

  - You are about to drop the column `allergies` on the `HealthProfile` table. All the data in the column will be lost.
  - You are about to drop the column `currentMedications` on the `HealthProfile` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `HealthProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthProfile" DROP COLUMN "allergies",
DROP COLUMN "currentMedications",
DROP COLUMN "emergencyContact",
ADD COLUMN     "dob" TEXT,
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "medications" TEXT,
ADD COLUMN     "weight" TEXT;
