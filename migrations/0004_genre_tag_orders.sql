-- genre_tag_orders テーブルを新設する
-- ジャンルごとにタグの所属と並び順を独立管理できるようにする
CREATE TABLE "genre_tag_orders" (
	"genre" "articles_genre_enum" NOT NULL,
	"tag_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "genre_tag_orders_pkey" PRIMARY KEY("genre","tag_id")
);
--> statement-breakpoint
ALTER TABLE "genre_tag_orders" ADD CONSTRAINT "genre_tag_orders_tag_id_tags_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags_table"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
-- 既存タグを全ジャンルに移行する（現在の sortOrder を引き継ぐ）
INSERT INTO "genre_tag_orders" ("genre", "tag_id", "sort_order")
SELECT 'products'::"articles_genre_enum", id, sort_order FROM "tags_table";
--> statement-breakpoint
INSERT INTO "genre_tag_orders" ("genre", "tag_id", "sort_order")
SELECT 'blogs'::"articles_genre_enum", id, sort_order FROM "tags_table";
--> statement-breakpoint
INSERT INTO "genre_tag_orders" ("genre", "tag_id", "sort_order")
SELECT 'books'::"articles_genre_enum", id, sort_order FROM "tags_table";
--> statement-breakpoint
-- sort_order は genre_tag_orders で管理するようになったため tags_table から削除する
ALTER TABLE "tags_table" DROP COLUMN "sort_order";
