// アップロードを許可する画像形式の一覧
// 拡張子と Content-Type はクライアントの申告（file.name / file.type）ではなく、
// ここで判定した結果からサーバー側で決める。申告は curl などで自由に偽装できるため
export const ALLOWED_IMAGE_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
} as const;

export type ImageExt = keyof typeof ALLOWED_IMAGE_TYPES;
export type DetectedImage = { ext: ImageExt; mime: (typeof ALLOWED_IMAGE_TYPES)[ImageExt] };

// bytes の offset 位置から signature と同じバイト列が並んでいるかを調べる
const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);

// ファイルの中身（先頭のバイト列）から画像形式を判定する
// PNG や JPEG などのバイナリ形式は、ファイル先頭に形式ごとに決まった「マジックナンバー」が書かれている。
// 拡張子や Content-Type と違い、中身そのものを見るので偽装された申告に騙されない
export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A（"\x89PNG\r\n\x1a\n"）
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: 'png', mime: 'image/png' };
  // JPEG: FF D8 FF（SOI マーカー + 次のマーカーの先頭）
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { ext: 'jpg', mime: 'image/jpeg' };
  // GIF: "GIF87a" または "GIF89a"。共通部分の "GIF8" で判定する
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return { ext: 'gif', mime: 'image/gif' };
  // WebP: "RIFF" + 4バイトのファイルサイズ + "WEBP"
  // RIFF は WAV や AVI でも使われる入れ物の形式なので、8バイト目からの "WEBP" まで確認する
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  // SVG はテキスト（XML）形式でマジックナンバーが無いため、先頭部分を文字列として読んで <svg タグの有無で判定する
  // 先頭に <?xml ...?> 宣言やコメントが付くことがあるので、先頭一致ではなく「先頭 1KB 内に含まれるか」で見る
  const head = new TextDecoder().decode(bytes.subarray(0, 1024));
  if (/<svg[\s>]/i.test(head)) return { ext: 'svg', mime: 'image/svg+xml' };
  return null;
}
