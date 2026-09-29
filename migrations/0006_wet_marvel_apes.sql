CREATE TABLE "diary_entries_table" (
	"date" date PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
