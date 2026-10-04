import { Suspense } from 'react';
import type { Metadata } from 'next';
import HistoryTimelinePage from '@/components/HistoryTimelinePage';
import HistoryLegacyOrderRedirect from '@/components/HistoryLegacyOrderRedirect';
import { siteOpenGraph } from '@/lib/siteMetadata';

export const metadata: Metadata = {
  title: '年表',
  openGraph: siteOpenGraph('年表'),
};

// 年表（古い順）。ページごと作り置きにする（並び順の切り替えは /history/newest という別のページ）
export default function HistoryPage() {
  return (
    <>
      {/* 以前の URL（/history?order=newest）で開かれたときに、新しい順のページへ移す
          URL の検索パラメータを読むとページ全体を毎回組み立てることになるので、ブラウザ側で読む部品に分けている
          （Suspense の中だけがブラウザでの描画になり、年表本体は作り置きのまま） */}
      <Suspense>
        <HistoryLegacyOrderRedirect />
      </Suspense>
      <HistoryTimelinePage newestFirst={false} />
    </>
  );
}
