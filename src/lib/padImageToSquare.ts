// タグ画像は正方形の枠に object-cover で表示される仕様のため、非正方形の画像をそのままアップロードすると
// 短い方の辺がトリミングされて見切れてしまう。
// この関数は画像の長い方の辺に合わせた正方形キャンバスを作り、中央に描画することで
// 短い方の辺の余白を透明ピクセルで埋めた新しい画像ファイルを返す。
export async function padImageToSquare(file: File): Promise<File> {
  // SVG は座標系がラスター画像と異なり、意図しないサイズで描画されることがあるため対象外にする
  if (file.type === 'image/svg+xml') return file;

  const bitmap = await createImageBitmap(file);
  const size = Math.max(bitmap.width, bitmap.height);

  // すでに正方形なら変換不要
  if (bitmap.width === bitmap.height) return file;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  // 短い方の辺を中央揃えにするためのオフセット
  const dx = (size - bitmap.width) / 2;
  const dy = (size - bitmap.height) / 2;
  ctx.drawImage(bitmap, dx, dy);

  // 透過を保持する必要があるため、元の形式に関わらず必ず PNG として書き出す
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return file;

  const name = file.name.replace(/\.[^./]+$/, '') + '.png';
  return new File([blob], name, { type: 'image/png' });
}
