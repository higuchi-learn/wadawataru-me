CREATE TABLE "genre_tag_orders" (
	"genre" "articles_genre_enum" NOT NULL,
	"tag_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "genre_tag_orders_genre_tag_id_pk" PRIMARY KEY("genre","tag_id")
);
--> statement-breakpoint
DROP INDEX "tags_sort_order_idx";--> statement-breakpoint
ALTER TABLE "genre_tag_orders" ADD CONSTRAINT "genre_tag_orders_tag_id_tags_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags_table" DROP COLUMN "sort_order";