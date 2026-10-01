import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import HistoryEventCard from '@/components/HistoryEventCard';
import { PageHero } from '@/components/PageSection';
import { getHistoryEventsList } from '@/db/queries/select';
import {
  HISTORY_KINDS,
  buildHistoryGraph,
  reverseHistoryGraph,
  historyKindColor,
  historyPeriodLabel,
  type HistoryLaneState,
} from '@/lib/history';

// 管理画面で出来事を追加・編集したらすぐ反映されるよう、ビルド時の静的生成ではなくリクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '年表',
};

// 行の上端から、出来事のドット（mt-2 + size-4 の中心）までの距離。期間の線はこの高さで本線から分かれる
const EVENT_DOT_Y = 16;
// 期間の終わりの行（高さ 24px）で、線が本線に戻る高さ
const END_DOT_Y = 12;
// 期間の線どうしの間隔。globals.css の .history-graph の --step と揃えること
const STEP = 14;

// 行の境目で線を少しはみ出させて、隣の行の線と重ねる長さ
// 行の高さは文章量で決まり 24.5px のような端数になるため、ぴったり突き合わせると境目に細い隙間が見えることがある
const OVERLAP = 1;

// 1行分の期間の線。行（position: relative）いっぱいに重ねて描く
// 縦線も L 字もすべて「本線から線の位置までの幅の箱」の右の枠線（太さ 3px）で描く
// 位置と幅の計算をまったく同じにしておくと、ブラウザや拡大率によるピクセルへの丸め方も同じになり、
// 曲がり角とまっすぐな部分で線の位置や太さがずれない
// 線の中心は本線から (lane + 1) * STEP の位置。箱の右端はそこから 2px 先（右の枠線が中心の 1px 手前〜2px 先にくる）
// 位置がすべて整数 px になるので線がにじまない（--main も globals.css で整数に丸めてある）
function LaneSegments({
  lanes,
  dotY,
  span = 'full',
}: {
  lanes: HistoryLaneState[];
  dotY: number;
  // 縦線を引く範囲。upper / lower は行の上半分・下半分だけ（年表の端の目印で線を止めるときに使う）
  span?: 'full' | 'upper' | 'lower';
}) {
  return (
    <>
      {lanes.map(({ lane, color, state }) => {
        const box = { left: 'var(--main)', width: (lane + 1) * STEP + 2, borderColor: color };
        if (state === 'pass') {
          return (
            <span
              key={lane}
              className="absolute border-r-3"
              style={{
                ...box,
                top: span === 'lower' ? '50%' : -OVERLAP,
                bottom: span === 'upper' ? '50%' : -OVERLAP,
              }}
            />
          );
        }
        // L 字は同じ箱に、上（下）の枠線も付けて角を丸める
        return state === 'start' ? (
          // 本線から右へ出て下へ。上の枠線の中心がドットの中心の高さに来るようにする
          <span
            key={lane}
            className="absolute border-t-3 border-r-3 rounded-tr-lg"
            style={{ ...box, top: dotY - 1, bottom: -OVERLAP }}
          />
        ) : (
          // 上から来て本線へ戻る
          <span
            key={lane}
            className="absolute border-b-3 border-r-3 rounded-br-lg"
            style={{ ...box, top: -OVERLAP, height: dotY + 2 + OVERLAP }}
          />
        );
      })}
    </>
  );
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  // ?order=newest のときだけ新しい順にする。ボタンはこのクエリを付け外しするリンク
  const newestFirst = (await searchParams).order === 'newest';
  const events = await getHistoryEventsList();
  const graph = buildHistoryGraph(events);
  const { laneCount, openLanes } = graph;
  const rows = newestFirst ? reverseHistoryGraph(graph.rows, openLanes) : graph.rows;

  // 左右交互の配置を時代をまたいで連続させるため、出来事の通し番号で偶奇を判定する
  let index = 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* ページタイトル。凡例と並び替えボタンは見出しの下に置く */}
      <PageHero en="History" ja="年表" lead="これまでの出来事を、時系列で並べています。">
        <div className="flex flex-wrap gap-2 mt-6">
          {HISTORY_KINDS.map((kind) => (
            <div key={kind.value} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm">
              <span className="size-3 rounded-full" style={{ backgroundColor: kind.color }} />
              <span className="text-xs text-black">{kind.label}</span>
            </div>
          ))}
          {laneCount > 0 && (
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm">
              <span className="w-4 h-[3px] rounded-full bg-[var(--lighttext)]" />
              <span className="text-xs text-black">右に分かれた線: 続いていた期間</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <Link
            href={newestFirst ? '/history' : '/history?order=newest'}
            className="text-sm font-bold text-white bg-[var(--ogangetext)] rounded-full px-5 py-2 shadow-sm hover:brightness-110 transition"
          >
            ⇅ 時系列を反転
          </Link>
          <span className="text-xs text-[var(--lighttext)]">{newestFirst ? '新しい順に表示中' : '古い順に表示中'}</span>
        </div>
      </PageHero>

      <div className="bg-white px-4 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--lighttext)] text-center py-8">まだ出来事がありません。</p>
        ) : (
          <div className="history-graph relative max-w-5xl mx-auto" style={{ '--lanes': laneCount } as CSSProperties}>
            {/* 本線 */}
            <div
              className="absolute top-0 bottom-0 -translate-x-1/2 w-1 rounded-full bg-[var(--unclickable)]"
              style={{ left: 'var(--main)' }}
            />

            {/* 新しい順のときは先頭に「現在」の目印を置き、現在も続いている期間の線をここから伸ばす */}
            {newestFirst && (
              <div className="relative pb-2">
                <LaneSegments lanes={openLanes} dotY={0} span="lower" />
                <div className="relative ml-8 md:ml-[var(--main)] md:-translate-x-1/2 w-fit border-2 border-dashed border-[var(--ogangetext)] text-[var(--ogangetext)] rounded-full px-5 py-1.5 text-sm font-bold bg-white whitespace-nowrap">
                  現在
                </div>
              </div>
            )}

            {rows.map((row) => {
              if (row.type === 'era') {
                return (
                  <div key={`era-${row.era}`} className="relative py-6">
                    <LaneSegments lanes={row.lanes} dotY={0} />
                    {/* 期間の線が通っている間は、見出しで線が隠れないよう線の外側にずらす */}
                    <div
                      className={`relative ${row.lanes.length > 0 ? 'history-pill-aside' : 'ml-8 md:ml-[var(--main)] md:-translate-x-1/2'} w-fit bg-black text-white rounded-full px-5 py-1.5 flex items-baseline gap-2 whitespace-nowrap`}
                    >
                      <span className="text-sm font-bold">{row.label}</span>
                      <span className="text-xs text-white/70">{row.period}</span>
                    </div>
                  </div>
                );
              }

              if (row.type === 'end') {
                return (
                  // 期間の線が本線に戻るための行。終わりの時期はカードに書いてあるので、ここには何も表示しない
                  <div key={`end-${row.event.id}`} className="relative h-6">
                    <LaneSegments lanes={row.lanes} dotY={END_DOT_Y} />
                  </div>
                );
              }

              const { event, branchColor } = row;
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
                period: branchColor ? { label: historyPeriodLabel(event.endDate), color: branchColor } : null,
              };
              return (
                <div key={event.id} className="history-row relative grid gap-x-4 md:gap-x-6 pb-8 md:pb-10">
                  <LaneSegments lanes={row.lanes} dotY={EVENT_DOT_Y} />

                  {/* md 以上: 左側の内容 */}
                  <div className="hidden md:block">{isLeft && <HistoryEventCard event={card} align="left" />}</div>

                  {/* ドット（本線の上）。グラフ列の中ではなく行に対して置くので、期間の線の数に関係なく本線に乗る */}
                  <span
                    className="absolute top-2 size-4 -translate-x-1/2 rounded-full ring-4 ring-white"
                    style={{ left: 'var(--main)', backgroundColor: historyKindColor(event.kind) }}
                  />
                  <div className="hidden md:block" aria-hidden />

                  {/* md 以上: 右側の内容 */}
                  <div className="hidden md:block">{!isLeft && <HistoryEventCard event={card} align="right" />}</div>

                  {/* モバイル: 常に右側 */}
                  <div className="md:hidden row-start-1 col-start-2">
                    <HistoryEventCard event={card} align="right" />
                  </div>
                </div>
              );
            })}

            {/* 古い順のときの終端。現在も続いている期間の線はここまで伸ばす */}
            {!newestFirst && (
              <div className="relative pt-2">
                <LaneSegments lanes={openLanes} dotY={0} span="upper" />
                <div className="relative ml-8 md:ml-[var(--main)] md:-translate-x-1/2 w-fit border-2 border-dashed border-[var(--ogangetext)] text-[var(--ogangetext)] rounded-full px-5 py-1.5 text-sm font-bold bg-white whitespace-nowrap">
                  現在
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
