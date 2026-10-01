import type { Metadata } from 'next';
import HistoryEventCard from '@/components/HistoryEventCard';
import { getHistoryEventsList } from '@/db/queries/select';
import { HISTORY_ERAS, HISTORY_KINDS, historyKindColor } from '@/lib/history';

// 管理画面で出来事を追加・編集したらすぐ反映されるよう、ビルド時の静的生成ではなくリクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '年表',
};

export default async function HistoryPage() {
  const events = await getHistoryEventsList();

  // 時代ごとにまとめる。出来事が1件もない時代は見出しごと出さない
  const eras = HISTORY_ERAS.map((era) => {
    const eraEvents = events.filter((e) => e.era === era.value);
    const years = eraEvents.map((e) => Number(e.sortDate.slice(0, 4)));
    const period = years.length ? `${Math.min(...years)} – ${Math.max(...years)}` : '';
    return { ...era, period, events: eraEvents };
  }).filter((era) => era.events.length > 0);

  // 左右交互の配置を時代をまたいで連続させるため、通し番号で偶奇を判定する
  let index = 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* ページタイトル */}
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <p className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">History</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">年表</h1>
        <div className="flex flex-wrap gap-5 mt-6">
          {HISTORY_KINDS.map((kind) => (
            <div key={kind.value} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: kind.color }} />
              <span className="text-xs text-[var(--lighttext)]">{kind.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white px-4 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        {eras.length === 0 ? (
          <p className="text-sm text-[var(--lighttext)] text-center py-8">まだ出来事がありません。</p>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            {/* 縦線: モバイルは左端、md 以上は中央 */}
            <div className="absolute top-0 bottom-0 left-[6px] md:left-1/2 md:-translate-x-1/2 w-1 rounded-full bg-[var(--unclickable)]" />

            {eras.map((era) => (
              <section key={era.value} className="relative">
                {/* 時代の見出し */}
                <div className="relative flex md:justify-center py-6">
                  <div className="ml-8 md:ml-0 bg-black text-white rounded-full px-5 py-1.5 flex items-baseline gap-2">
                    <span className="text-sm font-bold">{era.label}</span>
                    <span className="text-xs text-white/70">{era.period}</span>
                  </div>
                </div>

                {era.events.map((event) => {
                  const isLeft = index++ % 2 === 0;
                  const card = {
                    id: event.id,
                    dateLabel: event.dateLabel,
                    title: event.title,
                    summary: event.summary,
                    kind: event.kind,
                    badge: event.badge,
                    thumbnail: event.thumbnail,
                    hasDetail: event.content.trim() !== '',
                  };
                  return (
                    <div
                      key={event.id}
                      className="relative grid grid-cols-[16px_1fr] md:grid-cols-[1fr_32px_1fr] gap-x-4 md:gap-x-6 pb-8 md:pb-10"
                    >
                      {/* md 以上: 左側の内容 */}
                      <div className="hidden md:block">{isLeft && <HistoryEventCard event={card} align="left" />}</div>

                      {/* ドット */}
                      <div className="flex justify-center md:col-start-2 row-start-1 col-start-1">
                        <span
                          className="mt-2 size-4 rounded-full ring-4 ring-white"
                          style={{ backgroundColor: historyKindColor(event.kind) }}
                        />
                      </div>

                      {/* md 以上: 右側の内容 */}
                      <div className="hidden md:block">
                        {!isLeft && <HistoryEventCard event={card} align="right" />}
                      </div>

                      {/* モバイル: 常に右側 */}
                      <div className="md:hidden row-start-1 col-start-2">
                        <HistoryEventCard event={card} align="right" />
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}

            {/* 終端 */}
            <div className="relative flex md:justify-center pt-2">
              <div className="ml-8 md:ml-0 border-2 border-dashed border-[var(--ogangetext)] text-[var(--ogangetext)] rounded-full px-5 py-1.5 text-sm font-bold bg-white">
                To be continued…
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
