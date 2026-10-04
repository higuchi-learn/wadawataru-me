'use client';

import { useId, useState } from 'react';
import { useDialog } from '@/lib/useDialog';
import RoundButton from '@/components/RoundButton';
import type { TagItem } from '@/app/admin/tag-actions';
import { createTagAction, addExistingTagToGenreAction, type GenreTab } from '@/app/admin/tag-actions';

// TagItem を re-export して他コンポーネントがここから import できるようにする
export type { TagItem };

type Props = {
  tags: TagItem[];
  selectedNames: string[];
  onConfirm: (selectedNames: string[]) => void;
  onClose: () => void;
  // genre が渡された場合のみタグ作成・他ジャンル追加を表示する
  genre?: GenreTab;
  // このジャンルに未登録の他ジャンルタグ一覧
  otherGenreTags?: TagItem[];
  // ダイアログの見出し（読み上げソフトにも、何のための画面かとして伝わる）
  title?: string;
};

export default function TagSelectOverlay({
  tags: initialTags,
  selectedNames: initialSelected,
  onConfirm,
  onClose,
  genre,
  otherGenreTags: initialOtherGenreTags = [],
  title = 'タグを選択',
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  // 作成・他ジャンル追加で増えたタグを即時反映するためローカル state で管理する
  // props のまま参照すると Server Component 側の再レンダリングが起きるまで UI に反映されないため、
  // Client Component 内で state として持ち、楽観的に更新することで操作後すぐに表示が変わる
  const [availableTags, setAvailableTags] = useState<TagItem[]>(initialTags);
  // 他ジャンルタグも state で持つ理由：追加操作後にそのタグをリストから消す必要があるため
  // props の参照を直接変えることはできないので、state 経由で管理する
  const [otherGenreTags, setOtherGenreTags] = useState<TagItem[]>(initialOtherGenreTags);
  const [newTagName, setNewTagName] = useState('');
  // エラーは操作種別ごとに分離する
  // 共有してしまうと、「他ジャンル追加エラー」が「新規作成フォーム」の下に表示されるなどの
  // 表示位置のズレや、一方の操作が他方のエラーを消してしまう問題が起きる
  const [createError, setCreateError] = useState<string | null>(null); // 新規作成フォームのエラー
  const [otherGenreError, setOtherGenreError] = useState<string | null>(null); // 他ジャンル追加のエラー
  const [isCreating, setIsCreating] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // ダイアログとしての振る舞い（フォーカスの移動・トラップ・復帰、Esc で閉じる、背後のスクロール停止）は useDialog にまとめている
  // このコンポーネントは開いているときだけ描画されるので、open は常に true を渡す
  const panelRef = useDialog(true, onClose);
  const titleId = useId();

  const toggleTag = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  // 新規タグを作成してこのジャンルに追加し、自動選択する
  // createTagAction は同名タグが tags_table に存在する場合は新規作成せず再利用する
  // そのため「同名タグがすでにあるか？」を呼び出し元で気にする必要はない
  const handleCreate = async () => {
    if (!genre || !newTagName.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    // Server Action が通信エラーなどで例外を投げても、作成中のまま固まらないよう finally で必ず解除する
    try {
      const result = await createTagAction(newTagName.trim(), null, genre);
      if ('error' in result) {
        setCreateError(result.error);
        return;
      }
      // availableTags にすでに同じ id があれば追加しない（べき等性の担保）
      setAvailableTags((prev) => (prev.some((t) => t.id === result.id) ? prev : [...prev, result]));
      // 作成直後に自動選択することで、タグを作って即決定できる UX にする
      setSelected((prev) => (prev.includes(result.name) ? prev : [...prev, result.name]));
      setNewTagName('');
    } catch {
      setCreateError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsCreating(false);
    }
  };

  // 他ジャンルの既存タグをこのジャンルに追加し、メインリストへ移動して自動選択する
  // 「追加」後はタグがこのジャンルのメンバーになるため、他ジャンルセクションから消して
  // このジャンルのタグ一覧（availableTags）へ移動する。両セクションに同時に表示されるのを防ぐ
  const handleAddFromOtherGenre = async (tag: TagItem) => {
    if (!genre) return;
    setAddingId(tag.id);
    setOtherGenreError(null);
    try {
      const result = await addExistingTagToGenreAction(tag, genre);
      if ('error' in result) {
        setOtherGenreError(result.error);
        return;
      }
      // 他ジャンルリストから除去してメインリストに追加する
      setOtherGenreTags((prev) => prev.filter((t) => t.id !== tag.id));
      setAvailableTags((prev) => (prev.some((t) => t.id === result.id) ? prev : [...prev, result]));
      // 追加したタグを自動選択して即使える状態にする
      setSelected((prev) => (prev.includes(result.name) ? prev : [...prev, result.name]));
    } catch {
      setOtherGenreError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      {/* role="dialog" + aria-modal で、読み上げソフトに「ダイアログが開いた」「背後は操作対象外」と伝える
          aria-labelledby で見出しをダイアログの名前にする。tabIndex={-1} は、開いたときにここへフォーカスを移すため */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-2xl max-h-[80vh] bg-[var(--page-bg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 上部ボタン行。「キャンセル」は変更を取り消して閉じる、「決定」は選択を反映して閉じる */}
        <div className="flex items-center justify-between gap-2 p-3 shrink-0">
          <RoundButton onClick={onClose}>キャンセル</RoundButton>
          <h2 id={titleId} className="text-sm font-bold text-black">
            {title}
          </h2>
          <RoundButton state="Enabled" onClick={() => onConfirm(selected)}>
            決定
          </RoundButton>
        </div>

        {/* 選択中の件数と、まとめて解除するボタン。1 つずつ外さなくても、選び直しやすくする */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-4 pb-1 shrink-0 text-xs text-[var(--lighttext)]">
            <span>選択中: {selected.length}件</span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="font-bold text-[var(--ogangetext)] rounded-full px-2 py-1 hover:bg-[var(--enableorange)] transition-colors"
            >
              すべて解除
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto flex flex-col">
          {/* 選べるタグが 1 つもないとき。何も出さないと、空の画面に「キャンセル」「決定」だけが並んで壊れて見える
              （管理画面ではこの下の「新しいタグを作成」から追加できるので、公開側のときだけ案内を出す） */}
          {availableTags.length === 0 && !genre && (
            <p className="px-4 py-8 text-sm text-[var(--lighttext)] text-center">選べるタグはまだありません。</p>
          )}
          {/* このジャンルのタグ一覧 */}
          {availableTags.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 p-3">
              {availableTags.map((tag) => {
                const isSelected = selected.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    // aria-pressed: 選択中かどうかを読み上げソフトに伝える（見た目の色と枠線だけでは伝わらない）
                    aria-pressed={isSelected}
                    onClick={() => toggleTag(tag.name)}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl w-full transition-colors
                      ${
                        isSelected
                          ? 'bg-[var(--enableorange)] ring-2 ring-[var(--ogangetext)]'
                          : 'bg-white hover:bg-[var(--onmouseorange)]'
                      }`}
                  >
                    {/* 画像があるタグだけ画像の枠を表示する */}
                    {tag.imageUrl && (
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white shrink-0">
                        <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-xs leading-4 text-black text-center w-full truncate">{tag.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 他ジャンルのタグ（genre が渡された場合のみ表示） */}
          {genre && (
            <div className="border-t border-neutral-200 p-3 flex flex-col gap-2">
              <p className="text-xs text-[var(--lighttext)]">他ジャンルのタグ（クリックでこのジャンルに追加）</p>
              {otherGenreError && <p className="text-xs text-[var(--error)]">{otherGenreError}</p>}
              {otherGenreTags.length === 0 ? (
                <p className="text-xs text-[var(--lighttext)]">追加できるタグがありません。</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                  {otherGenreTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={addingId === tag.id}
                      onClick={() => void handleAddFromOtherGenre(tag)}
                      className="flex flex-col items-center gap-1 p-1 rounded-xl w-full bg-white border border-dashed border-neutral-300 hover:bg-[var(--onmouseorange)] transition-colors disabled:opacity-50"
                    >
                      {tag.imageUrl && (
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-white shrink-0">
                          <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-xs leading-4 text-black text-center w-full truncate">{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* タグ作成フォーム（genre が渡された場合のみ表示） */}
        {genre && (
          <div className="shrink-0 border-t border-neutral-200 p-3 flex flex-col gap-2">
            <p className="text-xs text-[var(--lighttext)]">新しいタグを作成して追加</p>
            {createError && <p className="text-xs text-[var(--error)]">{createError}</p>}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                // void: 返ってくる Promise を待たないことを明示する（エラーは handleCreate 内の try/catch で処理済み）
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleCreate();
                }}
                placeholder="タグ名（最大20字）"
                maxLength={20}
                className="bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 h-7 text-sm leading-5 flex-1 focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]"
              />
              {/* 作成中や名前が空のときは本当に押せなくする（見た目だけ灰色にしても押せてしまうため） */}
              <RoundButton
                state="Enabled"
                disabled={isCreating || !newTagName.trim()}
                onClick={() => void handleCreate()}
              >
                {isCreating ? '作成中…' : '作成'}
              </RoundButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
