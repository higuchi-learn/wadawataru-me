// 管理画面からアップロードする画像を、送信前にブラウザ上で WebP に変換する
// スクリーンショットを PNG のまま上げると 1 枚で数 MB になり、記事の表示が極端に遅くなるため
// （実測: 4.5MB の PNG → 長い辺 1920px・品質 0.85 の WebP で 183KB。見た目の違いはほぼ分からない）
//
// サーバー（Workers）ではなくブラウザで変換する理由:
//   Workers には画像処理ライブラリが無く、CPU 時間の制限も厳しい。ブラウザの canvas なら追加の依存なしで変換できる
//
// GitHub から移行する既存画像（scripts/ の移行スクリプト）も同じ設定で変換しているので、値を変えるときは両方そろえること

// 長い辺の上限（px）。記事の表示幅に対して十分な大きさ。これより小さい画像は拡大しない
export const MAX_IMAGE_DIMENSION = 1920;
// WebP の品質（0〜1）。1.0 にしても色差の間引きによる劣化は残るため画質はほぼ変わらず、大きさだけ約 2.5 倍になる
export const WEBP_QUALITY = 0.85;

// 変換しない形式
//   SVG : ベクター画像。ラスター化すると拡大時にぼやけ、ファイルも大きくなりうる
//   GIF : canvas に描くと 1 コマ目しか残らず、アニメーションが止まってしまう
//   WebP: すでに WebP。再変換すると劣化が重なるうえ、アニメーション WebP も 1 コマ目だけになってしまう
const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif', 'image/webp']);

export async function convertToWebp(file: File): Promise<File> {
  if (SKIP_TYPES.has(file.type)) return file;

  // createImageBitmap は画像をデコードしてピクセルデータにする。ブラウザが読めない形式（HEIC など）は例外になる
  // その場合は変換せず元のまま返し、受け付けるかどうかはサーバー側（/api/upload の形式判定）に任せる
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    // 長い辺が上限を超えるときだけ縮小する。縦横に同じ倍率を掛けるので比率は保たれる
    // Math.min(1, ...) で 1 を上限にしているので、小さい画像を拡大することはない
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    // 縮小時の補間を高品質にする（既定の 'low' だと、文字の多いスクリーンショットでギザギザが出やすい）
    ctx.imageSmoothingQuality = 'high';
    // canvas の初期状態は透明なので、PNG の透過部分（タグ画像の余白など）は WebP でも透明のまま残る
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
    // WebP を書き出せないブラウザ（古い Safari など）は、指定を無視して PNG を返す
    // その場合は WebP ではないので、元のファイルをそのまま使う
    if (!blob || blob.type !== 'image/webp') return file;

    // 拡張子だけ .webp に付け替える（サーバー側は中身から形式を判定するので、名前は表示用でしかない）
    const name = file.name.replace(/\.[^./]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } finally {
    // ImageBitmap はデコード済みのピクセルデータをメモリに持っているので、使い終わったら明示的に解放する
    bitmap.close();
  }
}
