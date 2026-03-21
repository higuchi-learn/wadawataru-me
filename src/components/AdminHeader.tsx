import type { Genre } from "@/components/GenreAbout";

const GENRE_NAMES: Record<Genre, string> = {
  products: "制作物",
  blog: "ブログ",
  books: "読書記録",
};

type PublishStatus = "draft" | "published" | "archived";

const PUBLISH_STATUS_INFO: Record<PublishStatus, { label: string; bgClass: string }> = {
  draft: { label: "未公開", bgClass: "bg-[var(--draft,#00a6f4)]" },
  published: { label: "公開中", bgClass: "bg-green-500" },
  archived: { label: "アーカイブ済", bgClass: "bg-gray-400" },
};

export type AdminHeaderTagProps = {
  genre: Genre;
  status?: "create" | "edit";
  publishStatus?: PublishStatus;
  className?: string;
};

export function AdminHeaderTag({
  genre,
  status = "create",
  publishStatus = "draft",
  className,
}: AdminHeaderTagProps) {
  const ps = PUBLISH_STATUS_INFO[publishStatus];
  return (
    <div className={`flex items-center gap-1 px-1 ${className ?? ""}`}>
      <div className="flex gap-2.5 items-center justify-center text-2xl font-bold leading-8 text-black whitespace-nowrap">
        <span>{status === "create" ? "新規作成" : "編集"}</span>
        <span>（{GENRE_NAMES[genre]}）</span>
      </div>
      {status === "edit" && (
        <span className={`${ps.bgClass} text-white text-lg leading-7 px-1 rounded-md shadow-sm`}>
          {ps.label}
        </span>
      )}
    </div>
  );
}

export type AdminHeaderProps = {
  genre: Genre;
  status?: "create" | "edit";
  publishStatus?: PublishStatus;
  savedAt?: string;
  onArchive?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  className?: string;
};

export default function AdminHeader({
  genre,
  status = "create",
  publishStatus = "draft",
  savedAt,
  onArchive,
  onSaveDraft,
  onPublish,
  className,
}: AdminHeaderProps) {
  return (
    <div className={`flex h-10 items-center justify-between w-full bg-white shrink-0 ${className ?? ""}`}>
      <AdminHeaderTag genre={genre} status={status} publishStatus={publishStatus} />
      <div className="flex items-center gap-1.5 p-1">
        {status === "edit" && savedAt && (
          <div className="flex items-center gap-0.5 text-sm leading-5 text-[var(--successtext,#497d00)] whitespace-nowrap">
            <span>最終保存日時 : {savedAt}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        )}
        {status === "edit" && (
          <button
            type="button"
            onClick={onArchive}
            className="flex items-center justify-center px-1 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm leading-7 whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
          >
            アーカイブ
          </button>
        )}
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex items-center justify-center px-1 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm leading-7 whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
        >
          下書き保存
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center justify-center px-1 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm leading-7 whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
        >
          公開
        </button>
      </div>
    </div>
  );
}
