'use client';

import { useEffect, useRef, useState } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { saveDiaryEntryAction } from '@/app/admin/diary-actions';
import { diaryEntrySchema } from '@/lib/schemas';
import { formatDiaryDate } from '@/lib/formatDate';
import { A4_WIDTH_MM, A4_HEIGHT_MM, A4_MM_TO_PX, A4TextPage } from '@/components/DiaryPageView';

type Props = {
  // 'yyyy-mm-dd'。1日1件しか存在しないため、日付そのものがこの日記のIDになる
  date: string;
  initialContent: string;
  initialSavedAt: string | null;
};

export default function DiaryEditor({ date, initialContent, initialSavedAt }: Props) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // プレビューは「閲覧ページ（DiaryBook）」と同じA4ページの見た目に揃え、実際に印刷される内容と
  // 常に一致するようにしている。画面表示用に、A4の実寸（mm）をプレビュー欄の大きさへ縮小するだけで、
  // 実寸そのものより大きく表示することはしない（scale の上限を1にしている）
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const availableWidth = Math.max(100, rect.width);
    const availableHeight = Math.max(100, rect.height);
    const a4WidthPx = A4_WIDTH_MM * A4_MM_TO_PX;
    const a4HeightPx = A4_HEIGHT_MM * A4_MM_TO_PX;
    setScale(Math.min(availableWidth / a4WidthPx, availableHeight / a4HeightPx, 1));
  }, []);

  const handleSave = async () => {
    // クライアント側バリデーションを先に走らせることで、明らかなエラーをサーバーへのリクエストなしに即座に表示できる
    const parsed = diaryEntrySchema.safeParse({ content });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setIsLoading(true);
    // Server Action は通信エラーなどで例外を投げることがある（戻り値の { error } とは別の経路）
    // try/catch がないと setIsLoading(false) に届かず、ボタンが「処理中」のまま固まる
    try {
      const result = await saveDiaryEntryAction(date, content);
      if (result?.error) {
        setError(result.error);
      }
    } catch (e) {
      // 成功時の redirect() は「NEXT_REDIRECT」という特殊な例外で画面遷移を実現している
      // これを握りつぶすと遷移しなくなるため、unstable_rethrow で Next.js 内部の例外だけ投げ直す
      unstable_rethrow(e);
      setError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      // 成功時は redirect() でアンマウントされるため基本的に意味はないが、
      // finally に置くことで成功・失敗・例外のどの経路でもローディング状態が必ず解除される
      setIsLoading(false);
    }
  };

  const a4WidthPx = A4_WIDTH_MM * A4_MM_TO_PX;
  const a4HeightPx = A4_HEIGHT_MM * A4_MM_TO_PX;

  return (
    <div className="flex flex-col flex-1 min-h-0 px-1">
      <div className="flex h-10 items-center justify-between w-full bg-white shrink-0">
        <span className="text-2xl font-bold leading-8 text-black px-1 whitespace-nowrap">{formatDiaryDate(date)}</span>
        <div className="flex items-center gap-1.5 p-1">
          <span className="text-sm leading-5 whitespace-nowrap">
            {initialSavedAt ? (
              <span className="text-[var(--successtext,#497d00)]">最終保存日時 : {initialSavedAt}</span>
            ) : (
              <span className="text-[var(--lighttext,#6a7282)]">まだ保存されていません</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={isLoading}
            className="flex items-center justify-center px-2 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm leading-7 whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoading ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-2 py-1 text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-sm shrink-0">{error}</div>
      )}

      <div className="flex flex-1 min-h-0 gap-3 pb-1 bg-white">
        <div className="w-1/2 pl-1 flex flex-col h-full overflow-hidden items-center">
          {/* 横に長すぎると読み書きしづらいので、最大幅を決めて中央寄せにしている */}
          <div className="w-full max-w-2xl flex flex-col flex-1 min-h-0">
            <p className="text-xs leading-4 text-black mb-0.5">本文（横書きで入力）</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日あったことを書く..."
              className="flex-1 min-h-0 resize-none bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 py-1.5 text-sm leading-6 w-full focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]"
            />
          </div>
        </div>

        <div className="w-1/2 pr-1 flex flex-col h-full overflow-hidden">
          <p className="text-xs leading-4 text-black mb-0.5">縦書きプレビュー（実際にA4へ印刷される見た目）</p>
          <div ref={rowRef} className="flex-1 min-h-0 flex items-center justify-center">
            {scale !== null && (
              <div
                className="relative shrink-0 border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-md overflow-hidden"
                style={{ width: a4WidthPx * scale, height: a4HeightPx * scale }}
              >
                <div
                  style={{
                    width: a4WidthPx,
                    height: a4HeightPx,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <A4TextPage text={content} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
