type TagLabelProps = {
  label: string;
  // 画像の URL がある場合だけ左端に画像を表示する。null・undefined（画像なし）のときは画像の枠ごと出さない
  imageUrl?: string | null;
  isSelected?: boolean;
  // 渡された場合のみ右端に × ボタンを表示する
  onRemove?: () => void;
};

export default function TagLabel({ label, imageUrl, isSelected, onRemove }: TagLabelProps) {
  return (
    <div
      // 受賞歴ページの技術ラベルと同じピル型（クリーム色＋薄い枠線＋丸い角）にして、サイト全体でタグの見た目をそろえる
      // 画像があるときは左の余白を小さくし、画像の左端とピルの丸みの間が空きすぎないようにする
      className={`flex items-center gap-1 py-0.5 pr-2.5 ${imageUrl ? 'pl-1' : 'pl-2.5'} rounded-full bg-[var(--cream)] border border-[var(--softborder)] ${isSelected ? 'ring-1 ring-[var(--ogangetext)]' : ''}`}
    >
      {/* 画像があるタグだけ画像の枠を表示する（画像のないタグに空の四角を出しても意味がないため）
          背景は白: タグ画像はアップロード時に透明の余白で正方形にしている（padImageToSquare）ため、
          背景が灰色だと余白部分が灰色の帯になって見づらい。白ならロゴの周りが自然になじむ */}
      {imageUrl && (
        <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0 bg-white">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <span className="text-xs leading-4 font-normal text-black whitespace-nowrap">{label}</span>
      {/* onRemove が渡されたときだけ × ボタンを表示する */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            // 親要素のクリックイベント（タグ選択など）に伝播しないようにする
            e.stopPropagation();
            onRemove();
          }}
          // 押せる範囲を 24×24px（size-6）にする。「×」の文字だけ（約 11×16px）だと指で押しにくく、
          // 検索バーではすぐ隣が「押すと選択画面が開く場所」なので、押し間違えて選択画面が開いてしまう
          // -my-1・-mr-2 の負の余白で、押せる範囲だけを広げ、ラベルの高さや見た目の位置はほぼ変えない
          className="shrink-0 inline-flex items-center justify-center size-6 -my-1 -mr-2 rounded-full leading-none text-[var(--lighttext)] hover:text-black hover:bg-[var(--enableorange)] transition-colors"
          aria-label={`${label}を削除`}
        >
          ×
        </button>
      )}
    </div>
  );
}
