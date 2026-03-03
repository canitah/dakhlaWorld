-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "schedule_type" TEXT,
ADD COLUMN     "study_field" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "budget_max" INTEGER,
ADD COLUMN     "budget_min" INTEGER,
ADD COLUMN     "preferred_field" TEXT,
ADD COLUMN     "preferred_schedule" TEXT;
