export type Heading = {
  level: number;
  text: string;
  id: string;
};

export function generateHeadingId(text: string): string {
  return text
    .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // インラインコードのバッククォートを除去
    .toLowerCase()
    // スペース（1文字以上）をハイフンに変換する
    .replace(/\s+/g, '-')
    // 許可する文字以外を除去する
    // \w は英数字とアンダースコア、\u3040-\u30ff はひらがな・カタカナ
    // \u3400-\u4dbf は CJK Unified Ideographs Extension A、\u4e00-\u9fff は漢字
    .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '')
    // 連続するハイフンを1つにまとめる（例: "foo--bar" → "foo-bar"）
    .replace(/-+/g, '-')
    // 先頭・末尾のハイフンを除去する
    .replace(/^-|-$/g, '');
}

export function parseHeadings(markdown: string): Heading[] {
  // ^ は行頭にマッチ（m フラグで各行の先頭を対象にする）
  // (#{1,6}) で # の個数（見出しレベル）をキャプチャし、(.+) でテキストをキャプチャする
  // g フラグで全マッチを検索する
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  // regex.exec() は1回呼ぶたびに次のマッチを返す。マッチがなくなると null を返す
  while ((match = regex.exec(markdown)) !== null) {
    // match[1] は '#' の個数なので .length が見出しレベルになる
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: generateHeadingId(text) });
  }
  return headings;
}
