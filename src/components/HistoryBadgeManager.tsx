'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createHistoryBadgeAction,
  renameHistoryBadgeAction,
  deleteHistoryBadgeAction,
} from '@/app/admin/history-actions';

type Badge = { id: string; name: string; usageCount: number };

const inputClass =
  'bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 text-sm leading-5 h-7 w-32 focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]';

const buttonClass =
  'text-xs text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-40 disabled:pointer-events-none';

// 年表のラベル（受賞・資格など）の追加・名前変更・削除を行う管理パネル
export default function HistoryBadgeManager({ badges }: { badges: Badge[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  // 名前変更中のラベルの id と入力中の名前。null なら編集していない
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Server Action の結果を受けて、エラー表示か一覧の再取得を行う
  const run = async (action: () => Promise<{ error: string } | object | undefined>, onSuccess?: () => void) => {
    setError(null);
    setIsLoading(true);
    const result = await action();
    setIsLoading(false);
    if (result && 'error' in result) {
      setError(result.error);
      return;
    }
    onSuccess?.();
    // revalidatePath 済みのサーバーコンポーネント（使用件数・一覧のラベル表示）を再取得する
    router.refresh();
  };

  const handleDelete = (badge: Badge) => {
    const message =
      badge.usageCount > 0
        ? `ラベル「${badge.name}」を削除します。付いている ${badge.usageCount} 件の出来事は「ラベルなし」になります。よろしいですか？`
        : `ラベル「${badge.name}」を削除します。よろしいですか？`;
    if (!window.confirm(message)) return;
    void run(() => deleteHistoryBadgeAction(badge.id));
  };

  return (
    <section className="flex flex-col gap-2 border border-[var(--inputborder,#9f9fa9)] rounded-sm px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-black">ラベル</h2>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新しいラベル（最大10字）"
            className={`${inputClass} w-48`}
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              void run(
                () => createHistoryBadgeAction(newName),
                () => setNewName(''),
              )
            }
            className={`${buttonClass} border border-[var(--inputborder,#9f9fa9)] rounded-full px-3 py-1`}
          >
            追加
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-[var(--error)]">{error}</p>}

      {badges.length === 0 ? (
        <p className="text-xs text-[var(--lighttext)]">まだラベルがありません。</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) =>
            editing?.id === badge.id ? (
              <div key={badge.id} className="flex items-center gap-1">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ id: badge.id, name: e.target.value })}
                  autoFocus
                  className={inputClass}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    void run(
                      () => renameHistoryBadgeAction(badge.id, editing.name),
                      () => setEditing(null),
                    )
                  }
                  className={buttonClass}
                >
                  保存
                </button>
                <button type="button" onClick={() => setEditing(null)} className={buttonClass}>
                  やめる
                </button>
              </div>
            ) : (
              <div
                key={badge.id}
                className="flex items-center gap-2 bg-[var(--enableorange)] rounded-full pl-3 pr-2 py-0.5"
              >
                <span className="text-xs font-bold text-[var(--ogangetext)]">{badge.name}</span>
                <span className="text-xs text-[var(--lighttext)]">{badge.usageCount}件</span>
                <button
                  type="button"
                  onClick={() => setEditing({ id: badge.id, name: badge.name })}
                  className={buttonClass}
                >
                  名前変更
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDelete(badge)}
                  className={`${buttonClass} hover:!text-[var(--error)]`}
                >
                  削除
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
