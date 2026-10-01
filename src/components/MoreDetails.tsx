'use client';

import { useRef, type ReactNode } from 'react';

// 「くわしく」ボタンと、押すと開くポップアップ。カードには要点だけ置き、長い文章はここで読んでもらう
// クリックで開閉するため 'use client' が必要。media / header / children はサーバーコンポーネントから JSX のまま渡してよい
export default function MoreDetails({
  title,
  media,
  header,
  label = 'くわしく',
  children,
}: {
  // ポップアップの見出し。どのカードの詳細かがわかるように、カードのタイトルを渡す
  title: string;
  // ポップアップ上部に全幅で出す画像部分。カードと同じ部品を渡し、カードで見た画像をポップアップでも見られるようにする
  media?: ReactNode;
  // 見出しの下に出す情報（バッジ・期間・要約など）。これもカードと同じ部品を渡す
  header?: ReactNode;
  label?: string;
  // 「くわしく」でだけ読める本文
  children: ReactNode;
}) {
  // useRef で <dialog> 要素そのものを掴み、showModal() / close() を呼べるようにする
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    dialogRef.current?.showModal();
    // モーダルの後ろでページ本体がスクロールしないよう、開いている間だけ html のスクロールを止める
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        // group は「ボタンのホバー」を子の矢印に伝えるため。-ml-3 で背景が出ても文字の左端がカードの他の文字と揃う
        className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1 -ml-3 text-xs font-bold text-[var(--ogangetext)] cursor-pointer transition-colors duration-200 hover:bg-[var(--enableorange)]"
      >
        {label}
        {/* ホバー中は矢印が右へ少し動いて「押せる」ことを示す */}
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">›</span>
      </button>

      {/* showModal() で開いた <dialog> は、ブラウザが自動で最前面に出し、背面の操作を止め、Esc キーで閉じられるようにしてくれる */}
      <dialog
        ref={dialogRef}
        aria-label={title}
        // close イベントは × ボタン・背景クリック・Esc のどれで閉じても発火するので、スクロールの復帰はここでまとめて行う
        onClose={() => {
          document.documentElement.style.overflow = '';
        }}
        // 背景（::backdrop）をクリックしたときだけ閉じる。
        // dialog 自身は余白 0 で中身が全面を覆っているので、e.target が dialog になるのは背景部分をクリックしたときだけ
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        // Tailwind の preflight が margin を 0 にするので m-auto で中央に戻す。
        // backdrop: は開いているときの背面（::backdrop）のスタイル。
        // starting: は表示し始めの状態（@starting-style）で、そこから opacity / scale が変化してふわっと出る
        className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm transition-[opacity,scale] duration-200 starting:opacity-0 starting:scale-95"
      >
        {/* 閉じるボタン。sticky + 高さ 0 の箱に入れることで、中身をスクロールしても右上に残り続ける */}
        <div className="sticky top-0 z-10 h-0 flex justify-end">
          <button
            type="button"
            onClick={close}
            aria-label="閉じる"
            className="mt-3 mr-3 shrink-0 size-10 rounded-full flex items-center justify-center bg-white/90 text-black shadow-md backdrop-blur cursor-pointer transition-colors hover:bg-[var(--enableorange)] hover:text-[var(--ogangetext)]"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {media}

        <div className="p-6 sm:p-8">
          {/* 画像がないときは閉じるボタンと見出しが重ならないよう右に余白を取る */}
          <h3 className={`text-xl sm:text-2xl font-bold text-black leading-snug ${media ? '' : 'pr-12'}`}>{title}</h3>
          {header && <div className="mt-4">{header}</div>}
          {/* カードにもあった情報と、ここで初めて読む本文との区切り */}
          <div className="my-6 h-px bg-[var(--softborder)]" />
          {children}
        </div>
      </dialog>
    </>
  );
}
