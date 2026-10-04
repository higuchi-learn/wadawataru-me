import type { Metadata } from 'next';
import HistoryTimelinePage from '@/components/HistoryTimelinePage';

export const metadata: Metadata = {
  title: '年表（新しい順）',
  // 内容は /history と同じ（並び順だけ違う）ので、検索エンジンには /history を正式な URL として伝える
  alternates: { canonical: '/history' },
};

// 年表（新しい順）。/history と同じくページごと作り置きにする
// （history/[id] より、この newest という固定の名前のフォルダの方が優先される）
export default function HistoryNewestPage() {
  return <HistoryTimelinePage newestFirst />;
}
