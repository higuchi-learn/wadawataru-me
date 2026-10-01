import type { SelectHistoryEvent } from '@/db/schema';

export type HistoryEra = SelectHistoryEvent['era'];
export type HistoryKind = SelectHistoryEvent['kind'];

// 年表上の並び順もこの配列の順番になる
export const HISTORY_ERAS: { value: HistoryEra; label: string }[] = [
  { value: 'elementary', label: '小学校' },
  { value: 'junior_high', label: '中学校' },
  { value: 'high_school', label: '高校' },
  { value: 'university', label: '大学' },
  { value: 'career', label: '社会人' },
];

export const HISTORY_KINDS: { value: HistoryKind; label: string; color: string }[] = [
  { value: 'life', label: '学校・活動・仕事', color: 'var(--ogangetext)' },
  { value: 'tech', label: '技術・開発・資格', color: 'var(--timelineblue)' },
];

export function historyKindColor(kind: HistoryKind): string {
  return HISTORY_KINDS.find((k) => k.value === kind)?.color ?? 'var(--ogangetext)';
}

export function historyEraLabel(era: HistoryEra): string {
  return HISTORY_ERAS.find((e) => e.value === era)?.label ?? era;
}
