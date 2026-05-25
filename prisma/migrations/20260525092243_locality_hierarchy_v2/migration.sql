-- AlterTable
ALTER TABLE "Locality" ADD COLUMN     "citySlug" TEXT,
ADD COLUMN     "isSelectable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentLocalityId" TEXT,
ADD COLUMN     "parentSlug" TEXT,
ADD COLUMN     "searchKeywords" TEXT,
ADD COLUMN     "stateCode" TEXT;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_parentLocalityId_fkey" FOREIGN KEY ("parentLocalityId") REFERENCES "Locality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
