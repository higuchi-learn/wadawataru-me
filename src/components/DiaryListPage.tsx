import Link from 'next/link';
import DiaryBook from '@/components/DiaryBook';
import PrintButton from '@/components/PrintButton';
import DiaryDatePicker from '@/components/DiaryDatePicker';
import { getDiaryEntriesList } from '@/db/queries/select';
import { getTodayDateString, formatDiaryDate } from '@/lib/formatDate';

// 一覧では本文をそのまま出さず、先頭部分だけをプレビューとして見せる
// 改行を空白に置き換えるのは、複数行の日記がリストの1行に収まるようにするため
function previewOf(content: string, maxLength = 60): string {
  const flat = content.replace(/\s+/g, ' ').trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}…` : flat;
}

export default async function DiaryListPage() {
  const entries = await getDiaryEntriesList();
  const today = getTodayDateString();
  const hasTodayEntry = entries.some((e) => e.date === today);

  return (
    <main className="flex-1 flex flex-col gap-3 py-2 w-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-1 shrink-0 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-black">日記</h1>
          <p className="text-xs text-[var(--lighttext,#6a7282)]">
            完全非公開。1日1件、横書きで書いて縦書きで振り返るための自分専用メモです。
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* 書き忘れた過去の日の日記を後から追加できるように、任意の日付（今日以前）を選べるようにする */}
          <DiaryDatePicker today={today} existingDates={entries.map((e) => e.date)} />
          <Link
            href={`/admin/diary/${today}`}
            className="bg-[var(--error-bg)] text-[var(--error)] text-sm leading-5 px-3 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
          >
            {hasTodayEntry ? '今日の日記を編集する' : '今日の日記を書く'}
          </Link>
          <PrintButton className="text-xs text-[var(--lighttext)] hover:text-[var(--ogangetext)] border border-[var(--inputborder,#9f9fa9)] rounded-full px-2 py-1.5 transition-colors" />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4 w-full px-1 h-[65vh] min-h-[420px] print:h-auto print:min-h-0 print:block">
        {/* 左: 最近の日付一覧。クリックするとその日の編集ページへ直接移動する */}
        <div className="w-1/3 flex flex-col gap-1.5 overflow-y-auto pr-1 print:hidden">
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--lighttext,#6a7282)] text-center py-4">まだ日記がありません。</p>
          ) : (
            entries.map((entry) => (
              <Link
                key={entry.date}
                href={`/admin/diary/${entry.date}`}
                className="flex flex-col gap-0.5 border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 py-1.5 hover:bg-[var(--onmouseorange)] transition-colors"
              >
                <span className="text-sm font-bold text-black">{formatDiaryDate(entry.date)}</span>
                <span className="text-xs text-[var(--lighttext,#6a7282)]">
                  {previewOf(entry.content) || '（本文なし）'}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* 右: 本のように読めるビュー（◀▶ボタンでページをめくる）。印刷時はこの領域を全部使う */}
        <div className="w-2/3 flex flex-col min-h-0 print:w-full print:block">
          <DiaryBook entries={entries.map((entry) => ({ date: entry.date, content: entry.content }))} />
        </div>
      </div>
    </main>
  );
}
