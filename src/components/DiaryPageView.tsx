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

// ===== 縦書き用の文字の整形 =====
// 日記は半角の記号・句読点で書いているため, 縦書きで自然に見えるように表示時だけ変換する
// （保存されている本文は書き換えない）

// 日本語の文字（ひらがな・カタカナ・漢字・全角記号）
const JA = '\\u3000-\\u30FF\\u3400-\\u9FFF\\uF900-\\uFAFF\\uFF00-\\uFFEF';

// 英単語・数字のかたまり。"Next.js" "don't" "1,000" "Hello, world" のように
// 英数字の間に挟まった記号・スペースもまとめて1つのかたまりとして扱う（"C++" の末尾の + なども含める）
const LATIN_RUN_REGEX = /[A-Za-z0-9]+(?:[ .,'\-_/:&+#@%]+[A-Za-z0-9]+)*[+#%]*/g;

// 日本語の直後の「,」「.」「..（2個以上）」
const JA_PUNCT_REGEX = new RegExp(`([${JA}])(\\.{2,}|,|\\.)`, 'g');

// 英数字のかたまり以外の部分（日本語の文章）を縦書き用に変換する
//   ・半角記号は全角にする（縦書きで横倒しにならないように）。「~」は「〜」にする
//   ・日本語の直後の「,」「.」は「、」「。」に,「...」は縦書き専用の三点リーダー「︙」にする
//     （横書き用の「…」は欧文フォントの Inter で描かれて縦向きにならないため）
//   ・日本語の直後ではない「,」「.」（"Wait." の「.」など）は半角のまま残す
//   ・句読点などの直後の半角スペースは, 全角文字自体に余白があるので取り除く
function convertJapaneseSegment(text: string): string {
  return text
    .replace(/[!-~]/g, (c) => {
      if (c === ',' || c === '.') return c;
      if (c === '~') return '〜';
      return String.fromCharCode(c.charCodeAt(0) + 0xfee0);
    })
    .replace(JA_PUNCT_REGEX, (_, ch: string, punct: string) => {
      if (punct === ',') return `${ch}、`;
      if (punct === '.') return `${ch}。`;
      return `${ch}︙`;
    })
    .replace(/([、。︙！？：；])[ \t]+/g, '$1');
}

// 文字列を「英数字のかたまり」と「それ以外」に分ける
function splitLatinRuns(text: string): { text: string; latin: boolean }[] {
  const segments: { text: string; latin: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(LATIN_RUN_REGEX)) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), latin: false });
    segments.push({ text: m[0], latin: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), latin: false });
  return segments;
}

// 本文の文字を縦書き用に変換する（英数字のかたまりはそのまま）
// 変換後の文字列を再度通しても結果は変わらない（何度適用しても安全）
export function toVerticalText(content: string): string {
  return splitLatinRuns(content)
    .map((seg) => (seg.latin ? seg.text : convertJapaneseSegment(seg.text)))
    .join('');
}

// ページの区切り位置 index が英数字のかたまりの途中にある場合, かたまりの先頭まで戻した位置を返す
// "2026" が "20" と "26" に分かれて別々に縦中横になる, といった崩れを防ぐ
// （かたまりが1ページに収まらないほど長い場合は, 仕方ないので途中で区切る）
export function adjustSplitIndex(text: string, index: number): number {
  for (const m of text.matchAll(LATIN_RUN_REGEX)) {
    const start = m.index;
    const end = start + m[0].length;
    if (start >= index) break;
    if (index < end) return start > 0 ? start : index;
  }
  return index;
}

// 1段落ぶんの文字列を HTML にする
//   ・1〜2桁の数字は縦中横（1文字ぶんのマスに横並びで収める）にする
//   ・3桁以上の数字や英語は, 半角のまま横倒しにしてイタリックにする
function paragraphToHtml(paragraph: string): string {
  return splitLatinRuns(paragraph)
    .map((seg) => {
      const html = escapeHtml(seg.text);
      if (!seg.latin) return html;
      if (/^[0-9]{1,2}$/.test(seg.text)) return `<span style="text-combine-upright:all">${html}</span>`;
      return `<span style="font-style:italic">${html}</span>`;
    })
    .join('');
}

// 段落の区切り（Enterで入力される \n）の見せ方を組み立てる
//   ・\n をそのまま使うと1行ぶん（ほぼ1文字ぶん）の空きができてしまうため、
//     高さ0.5em（およそ0.5文字ぶん）の区切りに置き換えて余白を半分にする
//   ・すべての段落の先頭に全角スペースを1つ差し込み、字下げ（1文字ぶんの字下げ）を表現する
//     （ページの最初の段落も含めて字下げする。日本語の本では段落の先頭は必ず字下げするため）
export function diaryContentToHtml(content: string): string {
  return toVerticalText(content)
    .split('\n')
    .map((paragraph) => `\u3000${paragraphToHtml(paragraph)}`)
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
