CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "action" text NOT NULL,
  "resource_type" text,
  "resource_id" uuid,
  "metadata" jsonb,
  "ip_address" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX "activity_logs_action_idx" ON "activity_logs" ("action");
--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" ("created_at" DESC);
