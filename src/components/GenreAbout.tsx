export type Genre = "products" | "blog" | "books";

const GENRE_INFO: Record<Genre, { title: string; description: string }> = {
  products: {
    title: "制作物",
    description: "個人開発やハッカソンで制作したプロダクトの紹介です.",
  },
  blog: {
    title: "ブログ",
    description: "日記です. 大学やサークルでの出来事やふと思ったことを書き残します.",
  },
  books: {
    title: "読書記録",
    description: "技術書の内容をざっくりまとめて, 学んだことをアウトプットする場です.",
  },
};

type GenreAboutProps = {
  genre: Genre;
  className?: string;
};

export default function GenreAbout({ genre, className }: GenreAboutProps) {
  const { title, description } = GENRE_INFO[genre];

  return (
    <div className={`flex flex-col gap-1 items-start p-1 ${className ?? ""}`}>
      <div className="border-b border-[var(--border)] h-7 relative overflow-hidden shrink-0 w-full">
        <p className="absolute top-0 left-0 text-xl font-bold leading-7 text-black whitespace-nowrap">
          {title}
        </p>
      </div>
      <p className="text-sm font-normal leading-5 text-black shrink-0 whitespace-nowrap">
        {description}
      </p>
    </div>
  );
}
