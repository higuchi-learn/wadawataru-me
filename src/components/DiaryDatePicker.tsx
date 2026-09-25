'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  // 'yyyy-mm-dd'。未来の日付を選べないように <input type="date"> の max に使う
  // サーバー側（JST）で計算した値を受け取るのは、ブラウザのタイムゾーンに左右されず「今日」を揃えるため
  today: string;
  // すでに日記が書かれている日付の一覧。選んだ日が「新規」か「編集」かをボタン表示で区別するために使う
  existingDates: string[];
};

// 過去の日付を選んで、その日の日記ページ（/admin/diary/[date]）へ移動するためのピッカー
// 編集ページ自体は「その日の行がなければ新規作成、あれば編集」を同じ画面で扱うので、
// ここでは日付を選ばせて遷移するだけでよい
export default function DiaryDatePicker({ today, existingDates }: Props) {
  const router = useRouter();
  const [date, setDate] = useState('');

  // Set にしておくと has() で O(1) 判定でき、日記が増えても毎回配列を走査せずに済む
  const existing = new Set(existingDates);
  const hasEntry = date !== '' && existing.has(date);
  // max 属性はカレンダー UI の制限にすぎず、手入力では未来日を入れられてしまうことがあるため、ここでも弾く
  // 'yyyy-mm-dd' はゼロ埋めの固定長なので、文字列の大小比較がそのまま日付の前後比較になる
  const isValid = date !== '' && date <= today;

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={date}
        max={today}
        onChange={(e) => setDate(e.target.value)}
        aria-label="日記を書く日付を選ぶ"
        className="text-sm border border-[var(--inputborder,#9f9fa9)] rounded-sm px-1.5 py-1 bg-[var(--inputcontainer)] focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]"
      />
      <button
        type="button"
        onClick={() => router.push(`/admin/diary/${date}`)}
        disabled={!isValid}
        className="text-sm leading-5 px-3 py-1.5 rounded-full whitespace-nowrap border border-[var(--inputborder,#9f9fa9)] text-[var(--lighttext)] hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        {hasEntry ? 'この日の日記を編集する' : 'この日の日記を書く'}
      </button>
    </div>
  );
}
