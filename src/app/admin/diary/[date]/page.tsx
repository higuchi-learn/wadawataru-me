import { notFound } from 'next/navigation';
import DiaryEditor from '@/components/DiaryEditor';
import { getDiaryEntryByDate } from '@/db/queries/select';
import { formatSavedAt } from '@/lib/formatDate';

// diary_entries_table.date は PostgreSQL の date 型なので 'yyyy-mm-dd' 形式のみ許可する
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function DiaryEntryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) notFound();

  // その日の日記が存在しなければ null（＝まだ書いていない日）。新規作成と編集を同じページで扱う
  const entry = await getDiaryEntryByDate(date);

  return (
    <DiaryEditor
      date={date}
      initialContent={entry?.content ?? ''}
      initialSavedAt={entry ? formatSavedAt(entry.updatedAt) : null}
    />
  );
}
