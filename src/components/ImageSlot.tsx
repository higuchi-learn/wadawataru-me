type ImageSlotProps = {
  // 画像を用意したら public/ 以下のパス（例: "/images/top/hero.webp"）を渡す。
  // 未指定の間は「ここに何の画像を入れるか」を示すプレースホルダを表示する
  src?: string;
  alt: string;
  // プレースホルダに表示する、入れるべき画像の説明
  hint: string;
  // サイズ・アスペクト比・角丸は置き場所ごとに違うので、呼び出し側で指定する
  className?: string;
};

export default function ImageSlot({ src, alt, hint, className = '' }: ImageSlotProps) {
  if (src) {
    // next/image は width/height か fill の指定が必要で、アスペクト比を className で決める
    // この部品とは相性が悪いため素の <img> を使う。object-cover で枠に合わせて切り抜く
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }

  return (
    // 画像の代わりなので role="img" と aria-label でスクリーンリーダーにも「画像の場所」と伝える
    <div
      role="img"
      aria-label={`${alt}（画像準備中）`}
      // 斜めストライプ＋破線枠で、一目で「仮の枠」とわかる見た目にしている
      className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[var(--clickingorange)] bg-[repeating-linear-gradient(135deg,#fff3e3_0_12px,#ffe9cf_12px_24px)] text-[var(--ogangetext)] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-7 fill-current opacity-70" aria-hidden="true">
        <path d="M9 3 7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
      <p className="text-[10px] font-bold tracking-widest">IMAGE</p>
      <p className="text-xs text-center px-4 leading-5 max-w-60">{hint}</p>
    </div>
  );
}
