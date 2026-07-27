-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_landlordId_fkey";

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
