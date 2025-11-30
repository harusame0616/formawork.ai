-- Split name column into first_name and last_name
ALTER TABLE "customers" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "last_name" text;--> statement-breakpoint
-- Note: Existing data will need manual migration. This default copies name to first_name.
UPDATE "customers" SET "first_name" = "name", "last_name" = '';--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "name";
