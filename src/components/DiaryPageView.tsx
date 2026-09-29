// 日記のページ（A4サイズ）の見た目を、閲覧ページ（DiaryBook）と編集ページ（DiaryEditor）の
// プレビューで共通化するための部品。両方とも「同じ見た目のA4ページ」になるよう、ここに集約している

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_MARGIN_MM = 15; // 実際に印刷したときの余白と揃える
export const A4_MM_TO_PX = 96 / 25.4; // CSSの仕様上 1in = 96px = 25.4mm。画面表示時の縮小率の計算にだけ使う
// ページ本文の見た目（フォントサイズ・行間）。実際のページと計測用の隠し要素で必ず同じ値を使う
// leading（行間）は縦書きでは「列と列の間隔」になる。広すぎたので詰めている
export const A4_TEXT_CLASS = 'text-sm leading-6';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 段落の区切り（Enterで入力される \n）の見せ方を組み立てる
//   ・\n をそのまま使うと1行ぶん（ほぼ1文字ぶん）の空きができてしまうため、
//     高さ0.5em（およそ0.5文字ぶん）の区切りに置き換えて余白を半分にする
//   ・すべての段落の先頭に全角スペースを1つ差し込み、字下げ（1文字ぶんの字下げ）を表現する
//     （ページの最初の段落も含めて字下げする。日本語の本では段落の先頭は必ず字下げするため）
export function diaryContentToHtml(content: string): string {
  return content
    .split('\n')
    .map((paragraph) => `\u3000${escapeHtml(paragraph)}`)
    .join('<span style="display:block;height:0.5em"></span>');
}

export function A4TextPage({ text }: { text: string }) {
  return (
    <div
      style={{ width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, padding: `${A4_MARGIN_MM}mm` }}
      className="bg-[#fdfaf3] flex justify-end overflow-hidden"
    >
      <div
        className={`h-full shrink-0 ${A4_TEXT_CLASS}`}
        style={{ writingMode: 'vertical-rl', whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: diaryContentToHtml(text) }}
      />
    </div>
  );
}

export function A4CoverPage() {
  return (
    <div
      style={{ width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm` }}
      className="bg-[#3f3a34] flex items-center justify-center"
    >
      <span className="text-2xl tracking-[0.4em] text-[#f5efe3]" style={{ writingMode: 'vertical-rl' }}>
        日記
      </span>
    </div>
  );
}
