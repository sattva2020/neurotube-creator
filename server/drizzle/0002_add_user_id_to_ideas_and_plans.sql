-- Step 1: Add nullable user_id column to ideas and plans
ALTER TABLE "ideas" ADD COLUMN "user_id" uuid;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "user_id" uuid;
--> statement-breakpoint

-- Step 2: Backfill — assign existing rows to first owner user
UPDATE "ideas" SET "user_id" = (SELECT "id" FROM "users" WHERE "role" = 'owner' LIMIT 1) WHERE "user_id" IS NULL;
--> statement-breakpoint
UPDATE "plans" SET "user_id" = (SELECT "id" FROM "users" WHERE "role" = 'owner' LIMIT 1) WHERE "user_id" IS NULL;
--> statement-breakpoint

-- Step 3: Set NOT NULL constraint
ALTER TABLE "ideas" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint

-- Step 4: Add FK constraints
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
