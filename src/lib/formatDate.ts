// DB から返る publishedAt は null になりうる（未公開記事）
// null の場合はプレースホルダー文字列を返してコンポーネント側で特別扱いしなくて済むようにする
export function formatDate(date: Date | null): string {
  if (!date) return '----年--月--日';
  const y = date.getFullYear();
  // getMonth() は 0 始まり（1月が0）なので +1 する
  // padStart(2, '0') で1桁の月・日を "01" のようにゼロ埋めする
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}年${m}月${d}日`;
}

// 管理画面のヘッダーに表示する「最終保存日時」用フォーマット
// formatDate と別関数にしているのは、時刻（時:分:秒）も含めるため
export function formatSavedAt(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}/${mo}/${d} | ${h}:${mi}:${s}`;
}
