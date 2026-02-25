CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"hook" text NOT NULL,
	"target_audience" text NOT NULL,
	"why_it_works" text NOT NULL,
	"search_volume" text NOT NULL,
	"primary_keyword" text NOT NULL,
	"secondary_keywords" jsonb NOT NULL,
	"niche" text NOT NULL,
	"topic" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid,
	"title" text NOT NULL,
	"markdown" text NOT NULL,
	"niche" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE no action ON UPDATE no action;