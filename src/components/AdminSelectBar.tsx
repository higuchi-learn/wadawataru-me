import Link from "next/link";
import StatusBar from "@/components/StatusBar";
import SearchBar from "@/components/SearchBar";
import type { Genre } from "@/components/GenreAbout";

type AdminSelectBarProps = {
  genre: Genre;
  className?: string;
};

export default function AdminSelectBar({ genre, className }: AdminSelectBarProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 px-1 py-2 ${className ?? ""}`}>
      <StatusBar />
      <SearchBar className="w-[365px]" />
      <Link
        href={`/admin/${genre}/create`}
        className="bg-[var(--error-bg)] text-[var(--error)] text-sm leading-5 px-1.5 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
      >
        新規作成
      </Link>
    </div>
  );
}
