// Cloudflare Workers の実行環境は UTC のため、Date の getFullYear() / getMonth() 等の
// ローカルタイム依存メソッドをそのまま使うと JST (+9) に変換されず9時間ずれる。
// Intl.DateTimeFormat に timeZone: 'Asia/Tokyo' を指定して JST の各パーツを取り出す。
function getJSTParts(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';
  return {
    y: get('year'),
    m: get('month'),
    d: get('day'),
    h: get('hour'),
    mi: get('minute'),
    s: get('second'),
  };
}

// DB から返る publishedAt は null になりうる（未公開記事）
// null の場合はプレースホルダー文字列を返してコンポーネント側で特別扱いしなくて済むようにする
export function formatDate(date: Date | null): string {
  if (!date) return '----年--月--日';
  const { y, m, d } = getJSTParts(date);
  return `${y}年${m}月${d}日`;
}

// 管理画面のヘッダーに表示する「最終保存日時」用フォーマット
// formatDate と別関数にしているのは、時刻（時:分:秒）も含めるため
export function formatSavedAt(date: Date): string {
  const { y, m, d, h, mi, s } = getJSTParts(date);
  return `${y}/${m}/${d} | ${h}:${mi}:${s}`;
}
