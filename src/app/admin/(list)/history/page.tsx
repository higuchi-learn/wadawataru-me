import Link from 'next/link';
import HistoryBadgeManager from '@/components/HistoryBadgeManager';
import { getHistoryEventsList, getHistoryBadgesList } from '@/db/queries/select';
import { HISTORY_ERAS, historyKindColor } from '@/lib/history';

// 保存のたびに最新の一覧を出したいので、ビルド時の静的生成ではなくリクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

export default async function AdminHistoryPage() {
  const [events, badges] = await Promise.all([getHistoryEventsList(), getHistoryBadgesList()]);

  return (
    <main className="flex-1 flex flex-col gap-3 py-2 w-full px-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-black">年表</h1>
          <p className="text-xs text-[var(--lighttext,#6a7282)]">
            公開ページ（/history）に表示される出来事の一覧です。「並び順の基準日」の古い順に並びます。
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/history"
            target="_blank"
            className="text-xs text-[var(--lighttext)] hover:text-[var(--ogangetext)] border border-[var(--inputborder,#9f9fa9)] rounded-full px-3 py-1.5 transition-colors"
          >
            公開ページを見る ↗
          </Link>
          <Link
            href="/admin/history/create"
            className="bg-[var(--error-bg)] text-[var(--error)] text-sm leading-5 px-3 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
          >
            出来事を追加する
          </Link>
        </div>
      </div>

      <HistoryBadgeManager badges={badges} />

      {events.length === 0 ? (
        <p className="text-sm text-[var(--lighttext,#6a7282)] text-center py-8">まだ出来事がありません。</p>
      ) : (
        HISTORY_ERAS.map((era) => {
          const eraEvents = events.filter((e) => e.era === era.value);
          if (eraEvents.length === 0) return null;
          return (
            <section key={era.value} className="flex flex-col gap-1.5">
              <h2 className="text-sm font-bold text-black mt-2">{era.label}</h2>
              {eraEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/history/${event.id}`}
                  className="flex items-center gap-3 border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-3 py-2 hover:bg-[var(--onmouseorange)] transition-colors"
                >
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: historyKindColor(event.kind) }}
                  />
                  <span className="text-xs text-[var(--lighttext)] w-28 shrink-0">{event.dateLabel}</span>
                  <span className="text-sm font-bold text-black flex-1 min-w-0 truncate">{event.title}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {event.badge && (
                      <span className="text-xs text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-2 py-0.5">
                        {event.badge}
                      </span>
                    )}
                    {event.thumbnail && (
                      <span className="text-xs text-[var(--lighttext)] border border-[var(--unclickable)] rounded-full px-2 py-0.5">
                        画像
                      </span>
                    )}
                    {event.content.trim() && (
                      <span className="text-xs text-[var(--lighttext)] border border-[var(--unclickable)] rounded-full px-2 py-0.5">
                        詳細
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </section>
          );
        })
      )}
    </main>
  );
}
