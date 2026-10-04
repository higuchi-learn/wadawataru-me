import type EasyMDE from 'easymde';
import { convertToWebp } from '@/lib/convertToWebp';

// 画像を /api/upload（R2）にアップロードして配信用 URL を取得する
// 管理画面の画像アップロード（記事の本文・サムネイル、年表、タグ画像）はすべてこの関数を通る
// そのため WebP への変換もここで行えば、どの画面から上げた画像にも漏れなく効く
export async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData();
  form.append('file', await convertToWebp(file));
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) return null;
  const { url } = await res.json<{ url: string }>();
  return url;
}

// EasyMDE に「画像の貼り付け・ドロップでアップロードし、カーソル位置に ![](url) を挿入する」動作を追加する
// onChange: CodeMirror の値は React の state と連動していないため、挿入後の本文を state に同期するために呼ぶ
export function attachImageUpload(mde: EasyMDE, onChange: (value: string) => void, onError: (message: string) => void) {
  // EasyMDE の内部は CodeMirror エディタで動いている
  const cm = mde.codemirror;

  const insertImage = (file: File) => {
    uploadImage(file)
      .then((url) => {
        if (!url) {
          onError('画像のアップロードに失敗しました。');
          return;
        }
        // cm.replaceSelection() でカーソル位置に Markdown の画像記法を挿入する
        cm.replaceSelection(`![](${url})`);
        onChange(cm.getValue());
      })
      .catch(() => onError('画像のアップロードに失敗しました。'));
  };

  cm.on('paste', (_: unknown, e: ClipboardEvent) => {
    const file = e.clipboardData?.files[0];
    // 画像以外（テキストなど）はデフォルトの貼り付け動作に任せる
    if (!file?.type.startsWith('image/')) return;
    // デフォルトの貼り付け処理を止めないと、画像バイナリがそのままエディタに入力されてしまう
    e.preventDefault();
    insertImage(file);
  });

  cm.on('drop', (_: unknown, e: DragEvent) => {
    const file = e.dataTransfer?.files[0];
    if (!file?.type.startsWith('image/')) return;
    e.preventDefault();
    insertImage(file);
  });
}
