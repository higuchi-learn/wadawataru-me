ALTER TABLE "history_events_table" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "history_events_table" ADD COLUMN "ongoing" boolean DEFAULT false NOT NULL;