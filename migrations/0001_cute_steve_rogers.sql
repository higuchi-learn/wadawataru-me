CREATE TABLE "post_tags_table" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "post_tags_table_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "posts_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"genre" "articles_genre_enum" NOT NULL,
	"slug" varchar(20) NOT NULL,
	"title" varchar(30) NOT NULL,
	"description" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"thumbnail" text,
	"status" "articles_status_enum" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "posts_table_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(20) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tags_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DROP TABLE "post_tags" CASCADE;--> statement-breakpoint
DROP TABLE "posts" CASCADE;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
ALTER TABLE "post_tags_table" ADD CONSTRAINT "post_tags_table_post_id_posts_table_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags_table" ADD CONSTRAINT "post_tags_table_tag_id_tags_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tags_sort_order_idx" ON "tags_table" USING btree ("sort_order");