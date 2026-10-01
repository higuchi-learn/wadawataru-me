CREATE TYPE "public"."history_era_enum" AS ENUM('elementary', 'junior_high', 'high_school', 'university', 'career');--> statement-breakpoint
CREATE TYPE "public"."history_kind_enum" AS ENUM('life', 'tech');--> statement-breakpoint
CREATE TABLE "history_badges_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(10) NOT NULL,
	CONSTRAINT "history_badges_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "history_events_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"era" "history_era_enum" NOT NULL,
	"sort_date" date NOT NULL,
	"date_label" varchar(20) NOT NULL,
	"kind" "history_kind_enum" NOT NULL,
	"badge_id" uuid,
	"title" varchar(40) NOT NULL,
	"summary" varchar(120),
	"content" text DEFAULT '' NOT NULL,
	"thumbnail" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "history_events_table" ADD CONSTRAINT "history_events_table_badge_id_history_badges_table_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."history_badges_table"("id") ON DELETE set null ON UPDATE no action;