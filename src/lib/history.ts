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

// 年表の出来事の id（uuid）の形式。形式が違う値で DB に問い合わせると型エラーになるので、先にこれで弾く
export const HISTORY_EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 年表の出来事からリンクする記事のジャンル
// 「技術・開発・資格」の出来事は制作物の記事、「学校・活動・仕事」の出来事はブログの記事にリンクする
// DB の product_slug 列は「リンクする記事の slug」として使い、どのジャンルの記事かは種類（kind）から決める
// （列を増やさずに済み、既存のリンクはすべて tech → 制作物なので、そのまま動く）
export function historyArticleGenre(kind: HistoryKind): 'products' | 'blogs' {
  return kind === 'tech' ? 'products' : 'blogs';
}

// リンクする記事の URL（/products/slug または /blogs/slug）
export function historyArticleHref(kind: HistoryKind, slug: string): string {
  return `/${historyArticleGenre(kind)}/${slug}`;
}

export function historyEraLabel(era: HistoryEra): string {
  return HISTORY_ERAS.find((e) => e.value === era)?.label ?? era;
}

// 期間のある出来事の線（ブランチ）の色。始まった順に割り当て、足りなくなったら先頭から使い回す
// 出来事の種類の色（オレンジ・青）と見分けやすいよう、それ以外の色相から選んでいる
export const HISTORY_BRANCH_COLORS = [
  '#8b5cf6',
  '#10b981',
  '#ec4899',
  '#f59e0b',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
  '#ef4444',
];

// 期間の終わりを表す文言。endDate が null なら現在も継続中
export function historyPeriodLabel(endDate: string | null): string {
  if (endDate === null) return '現在も続いています';
  if (endDate === '') return '終了日未設定';
  const [year, month] = endDate.split('-');
  return `${year}年${Number(month)}月まで`;
}

// 1本の線の、ある行での状態。start = この行で本線から分かれる、end = この行で本線に戻る、pass = 通過するだけ
export type HistoryLaneState = { lane: number; color: string; state: 'start' | 'pass' | 'end' };

type GraphEvent = Pick<SelectHistoryEvent, 'id' | 'era' | 'sortDate' | 'endDate' | 'ongoing'>;

export type HistoryGraphRow<E extends GraphEvent> =
  | { type: 'era'; era: HistoryEra; label: string; period: string; lanes: HistoryLaneState[] }
  | { type: 'event'; event: E; branchColor: string | null; lanes: HistoryLaneState[] }
  | { type: 'end'; event: E; color: string; lanes: HistoryLaneState[] };

// 年表の出来事を、時代の見出し・出来事・期間の終わりの行に並べ、期間の線をどの列（lane）に描くかを決める
// git のブランチグラフと同じく、同時に続いている期間の数だけ線が横に並ぶ。終わった線の列は次の期間で再利用する
// events は sortDate の古い順に並んでいる前提
export function buildHistoryGraph<E extends GraphEvent>(
  events: E[],
): { rows: HistoryGraphRow<E>[]; laneCount: number; openLanes: HistoryLaneState[] } {
  const rows: HistoryGraphRow<E>[] = [];
  // lanes[i] は i 列目を使っている期間。空いている列は null
  const lanes: ({ event: E; color: string } | null)[] = [];
  let branchCount = 0;
  let laneCount = 0;

  const passing = (): HistoryLaneState[] =>
    lanes.flatMap((l, lane) => (l ? [{ lane, color: l.color, state: 'pass' as const }] : []));

  // date より前に終わった期間の「終わり」の行を出し、その列を空ける
  // 同じ日に始まる出来事より後ろに置くため、終了日が date と同じものはまだ出さない
  const closeBefore = (date: string | null) => {
    const ending = lanes
      .flatMap((l, lane) => (l && l.event.endDate && (date === null || l.event.endDate < date) ? [{ ...l, lane }] : []))
      .sort((a, b) => a.event.endDate!.localeCompare(b.event.endDate!));
    for (const { event, color, lane } of ending) {
      rows.push({
        type: 'end',
        event,
        color,
        lanes: passing().map((s) => (s.lane === lane ? { ...s, state: 'end' as const } : s)),
      });
      lanes[lane] = null;
    }
  };

  for (const era of HISTORY_ERAS) {
    const eraEvents = events.filter((e) => e.era === era.value);
    if (eraEvents.length === 0) continue;
    // 時代の見出しより前に終わっている期間は、前の時代の中で閉じておく
    closeBefore(eraEvents[0].sortDate);
    const years = eraEvents.map((e) => Number(e.sortDate.slice(0, 4)));
    rows.push({
      type: 'era',
      era: era.value,
      label: era.label,
      period: `${Math.min(...years)} – ${Math.max(...years)}`,
      lanes: passing(),
    });

    for (const event of eraEvents) {
      closeBefore(event.sortDate);
      if (!event.endDate && !event.ongoing) {
        rows.push({ type: 'event', event, branchColor: null, lanes: passing() });
        continue;
      }
      const color = HISTORY_BRANCH_COLORS[branchCount++ % HISTORY_BRANCH_COLORS.length];
      let lane = lanes.indexOf(null);
      if (lane === -1) lane = lanes.length;
      const before = passing();
      lanes[lane] = { event, color };
      laneCount = Math.max(laneCount, lanes.length);
      rows.push({ type: 'event', event, branchColor: color, lanes: [...before, { lane, color, state: 'start' }] });
    }
  }
  // 最後の出来事より後に終わった期間も閉じる
  closeBefore(null);

  return { rows, laneCount, openLanes: passing() };
}

// buildHistoryGraph で古い順に並べた行を、新しい順に並べ替える
// 時代の見出しはそれぞれの時代の一番上に置いたまま、時代の並びと時代の中の行の並びを逆にする
// 上下が逆になるので、本線から分かれる所（start）と本線に戻る所（end）の線の向きも入れ替える
export function reverseHistoryGraph<E extends GraphEvent>(
  rows: HistoryGraphRow<E>[],
  openLanes: HistoryLaneState[],
): HistoryGraphRow<E>[] {
  const flip = (lanes: HistoryLaneState[]): HistoryLaneState[] =>
    lanes.map((s) => (s.state === 'pass' ? s : { ...s, state: s.state === 'start' ? 'end' : 'start' }));

  // 時代ごとのまとまり（見出し + その時代の行）に分ける。rows は必ず時代の見出しから始まる
  const blocks: { header: Extract<HistoryGraphRow<E>, { type: 'era' }>; items: HistoryGraphRow<E>[] }[] = [];
  for (const row of rows) {
    if (row.type === 'era') blocks.push({ header: row, items: [] });
    else blocks.at(-1)?.items.push({ ...row, lanes: flip(row.lanes) });
  }

  return blocks
    .map((block, i) => [
      // 新しい順では見出しが時代の終わりの位置に来るので、そこを通る線は「次の時代の始まりで続いている線」になる
      // 最後の時代なら、現在も続いている線
      { ...block.header, lanes: blocks[i + 1]?.header.lanes ?? openLanes },
      ...block.items.reverse(),
    ])
    .reverse()
    .flat();
}
