ALTER TABLE "customers" DROP CONSTRAINT "customers_email_unique";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;