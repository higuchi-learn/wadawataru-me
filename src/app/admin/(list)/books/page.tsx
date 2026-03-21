import { GenreAbout, SelectPageBar, CardList } from "@/components";
import AdminSelectBar from "@/components/AdminSelectBar";
import type { CardData } from "@/components";

const MOCK_CARDS: CardData[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `読書記録 ${i + 1}`,
  description: "技術書の内容をざっくりまとめて、学んだことをアウトプットします。",
  tags: ["技術書", "TypeScript"],
  publishedAt: "2026年03月06日",
  updatedAt: "2026年03月06日",
  href: `/admin/books/${i + 1}`,
}));

export default function AdminBooksPage() {
  return (
    <>
      {/* PostsHeader */}
      <div className="flex flex-col items-center py-1 w-full shrink-0">
        <GenreAbout genre="books" className="w-full" />
        <AdminSelectBar genre="books" className="w-full" />
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center gap-2.5">
        <div className="flex flex-col gap-1.5 items-center py-1 w-full">
          <SelectPageBar totalPages={5} />
          <CardList cards={MOCK_CARDS} />
          <SelectPageBar totalPages={5} />
        </div>
      </main>
    </>
  );
}
