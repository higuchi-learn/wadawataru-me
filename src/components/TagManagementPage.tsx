'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SquareButton from '@/components/SquareButton';
import { InputField } from '@/components/InputField';
import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
  removeTagFromGenreAction,
  addExistingTagToGenreAction,
  updateTagsSortOrderAction,
  type TagItem,
  type GenreTab,
} from '@/app/admin/tag-actions';

const GENRE_TABS: { value: GenreTab; label: string }[] = [
  { value: 'products', label: '制作物' },
  { value: 'blogs', label: 'ブログ' },
  { value: 'books', label: '読書記録' },
];

// ---- 画像アップロード（フォーム間で共有） ----

async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) return null;
  const { url } = (await res.json()) as { url: string };
  return url;
}

// ---- ソータブルタグカード ----

type SortableTagCardProps = {
  tag: TagItem;
  onEdit: (tag: TagItem) => void;
};

function SortableTagCard({ tag, onEdit }: SortableTagCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
      {/* 画像エリアがドラッグハンドル。PointerSensor の distance:8 制約により単なるクリックではドラッグが起動しない */}
      <div
        className="w-full aspect-square rounded-lg overflow-hidden bg-neutral-200 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {tag.imageUrl ? (
          <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
        ) : null}
      </div>
      {/* タグ名クリックで編集モーダルを開く */}
      <button
        type="button"
        onClick={() => onEdit(tag)}
        className="text-xs leading-4 text-black text-center w-full truncate hover:opacity-60 transition-opacity"
      >
        {tag.name}
      </button>
    </div>
  );
}

// ---- タグ編集モーダル ----

type TagEditModalProps = {
  tag: TagItem;
  genre: GenreTab;
  onSaved: (tag: TagItem) => void;
  onRemovedFromGenre: (id: string) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
};

function TagEditModal({ tag, genre, onSaved, onRemovedFromGenre, onDeleted, onClose }: TagEditModalProps) {
  const [name, setName] = useState(tag.name);
  const [imageUrl, setImageUrl] = useState(tag.imageUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    const result = await updateTagAction(tag.id, name, imageUrl || null);
    setIsLoading(false);
    if ('error' in result) { setError(result.error); return; }
    onSaved(result);
    onClose();
  };

  const handleRemoveFromGenre = async () => {
    setIsLoading(true);
    setError(null);
    const result = await removeTagFromGenreAction(tag.id, genre);
    setIsLoading(false);
    if (result?.error) { setError(result.error); return; }
    onRemovedFromGenre(tag.id);
    onClose();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    const result = await deleteTagAction(tag.id);
    setIsLoading(false);
    if (result?.error) { setError(result.error); return; }
    onDeleted(tag.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-4 w-80 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-black">タグを編集</p>
        {error && (
          <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] px-2 py-1 rounded-sm">{error}</p>
        )}
        <InputField label="タグ名" required hint="必須・最大20字" value={name} onChange={setName} placeholder="例: React" />
        <InputField
          label="画像"
          hint="任意・ペーストで追加"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="画像をペースト"
          onPaste={async (e) => {
            const file = e.clipboardData.files[0];
            if (!file?.type.startsWith('image/')) return;
            e.preventDefault();
            try {
              const url = await uploadImage(file);
              if (url) setImageUrl(url);
            } catch {
              setError('画像のアップロードに失敗しました。');
            }
          }}
        />
        {imageUrl && (
          <img src={imageUrl} alt="プレビュー" className="w-16 h-16 rounded-lg object-cover bg-neutral-200 ml-1" />
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <SquareButton state={!isLoading && name.trim() ? 'Enabled' : 'Disabled'} onClick={handleSave}>
            {isLoading ? '保存中…' : '保存'}
          </SquareButton>
          <SquareButton state="Disabled" onClick={onClose}>キャンセル</SquareButton>
        </div>
        {/* 破壊的操作は下段に分ける */}
        <div className="flex items-center gap-2 flex-wrap border-t border-neutral-100 pt-2">
          <SquareButton state={isLoading ? 'Disabled' : 'Enabled'} onClick={handleRemoveFromGenre}>
            このジャンルから除外
          </SquareButton>
          <SquareButton state={isLoading ? 'Disabled' : 'Enabled'} onClick={handleDelete}>
            完全に削除
          </SquareButton>
        </div>
      </div>
    </div>
  );
}

// ---- 他ジャンルのタグを追加するピッカー ----

type OtherGenreTagPickerProps = {
  tags: TagItem[];         // 他ジャンルにあってこのジャンルにまだないタグ一覧
  genre: GenreTab;
  onAdded: (tag: TagItem) => void;
  onClose: () => void;
};

function OtherGenreTagPicker({ tags, genre, onAdded, onClose }: OtherGenreTagPickerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdd = async (tag: TagItem) => {
    setLoadingId(tag.id);
    setError(null);
    const result = await addExistingTagToGenreAction(tag, genre);
    setLoadingId(null);
    if ('error' in result) { setError(result.error); return; }
    onAdded(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg p-4 w-96 max-h-[70vh] flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-black">他ジャンルのタグを追加</p>
        {error && (
          <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] px-2 py-1 rounded-sm">{error}</p>
        )}
        {tags.length === 0 ? (
          <p className="text-sm text-[var(--lighttext)]">追加できるタグがありません</p>
        ) : (
          <div className="overflow-auto flex-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  disabled={loadingId === tag.id}
                  onClick={() => handleAdd(tag)}
                  className="flex flex-col items-center gap-1 bg-[var(--inputcontainer)] hover:bg-[var(--onmouseorange)] active:bg-[var(--clickingorange)] rounded-xl p-1 transition-colors disabled:opacity-50"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-neutral-200">
                    {tag.imageUrl ? (
                      <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs leading-4 text-black text-center w-full truncate">{tag.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <SquareButton state="Disabled" onClick={onClose}>閉じる</SquareButton>
        </div>
      </div>
    </div>
  );
}

// ---- タグ追加フォーム ----

type TagCreateFormProps = {
  genre: GenreTab;
  onCreated: (tag: TagItem) => void;
};

function TagCreateForm({ genre, onCreated }: TagCreateFormProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    // 同名タグが既存の場合はそのタグをジャンルに追加する（tag-actions 内で処理）
    const result = await createTagAction(name, imageUrl || null, genre);
    setIsLoading(false);
    if ('error' in result) { setError(result.error); return; }
    setName('');
    setImageUrl('');
    onCreated(result);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col gap-2">
      <p className="text-sm font-medium text-black">タグを追加</p>
      {error && (
        <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] px-2 py-1 rounded-sm">{error}</p>
      )}
      <InputField label="タグ名" required hint="必須・最大20字" value={name} onChange={setName} placeholder="例: TypeScript" />
      <InputField
        label="画像"
        hint="任意・ペーストで追加（既存タグの場合は無視されます）"
        value={imageUrl}
        onChange={setImageUrl}
        placeholder="画像をペースト"
        onPaste={async (e) => {
          const file = e.clipboardData.files[0];
          if (!file?.type.startsWith('image/')) return;
          e.preventDefault();
          try {
            const url = await uploadImage(file);
            if (url) setImageUrl(url);
          } catch {
            setError('画像のアップロードに失敗しました。');
          }
        }}
      />
      {imageUrl && (
        <img src={imageUrl} alt="プレビュー" className="w-16 h-16 rounded-lg object-cover bg-neutral-200 ml-1" />
      )}
      <div className="ml-1">
        <SquareButton state={!isLoading && name.trim() ? 'Enabled' : 'Disabled'} onClick={handleSubmit}>
          {isLoading ? '追加中…' : '追加'}
        </SquareButton>
      </div>
    </div>
  );
}

// ---- メインコンポーネント ----

type Props = {
  initialTagsByGenre: Record<GenreTab, TagItem[]>;
};

export default function TagManagementPage({ initialTagsByGenre }: Props) {
  const [selectedGenre, setSelectedGenre] = useState<GenreTab>('products');
  // ジャンルごとにタグリストを独立して管理する
  const [tagsByGenre, setTagsByGenre] = useState<Record<GenreTab, TagItem[]>>(initialTagsByGenre);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentTags = tagsByGenre[selectedGenre];

  // 他ジャンルに存在しつつ現在のジャンルに未登録のタグを導出する（クライアント側で計算）
  // tagsByGenre はページ初期表示時に全ジャンル分ロード済みなので、追加の DB fetch は不要
  // ① 現在のジャンル以外のタグを1次元配列に展開する
  // ② 同じタグが複数ジャンルにあると重複して現れるため、id で一意に絞る
  // ③ 現在のジャンルにすでに登録されているタグは除外する（追加済みを再提示しない）
  const otherGenreTags = (Object.keys(tagsByGenre) as GenreTab[])
    .filter((g) => g !== selectedGenre)
    .flatMap((g) => tagsByGenre[g])
    .filter((tag, idx, arr) => arr.findIndex((t) => t.id === tag.id) === idx) // 重複除去
    .filter((tag) => !currentTags.some((t) => t.id === tag.id));             // 現ジャンル未登録のみ

  // 現在選択中のジャンルのタグリストだけを更新するヘルパー
  // setTagsByGenre を直接呼ぶと毎回全ジャンルを書き直す必要があるため、
  // スプレッドで他ジャンルを保持しつつ selectedGenre のみを差し替えるパターンをまとめた
  const updateCurrentTags = (updater: (prev: TagItem[]) => TagItem[]) => {
    setTagsByGenre((prev) => ({ ...prev, [selectedGenre]: updater(prev[selectedGenre]) }));
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentTags.findIndex((t) => t.id === active.id);
    const newIndex = currentTags.findIndex((t) => t.id === over.id);
    // arrayMove は dnd-kit のユーティリティで、配列の要素を移動した新しい配列を返す
    // 先にローカル state を更新することで UI がドラッグ後の位置へ即座に反映される（楽観的更新）
    const newTags = arrayMove(currentTags, oldIndex, newIndex);
    updateCurrentTags(() => newTags);

    // ドラッグ完了後にジャンル固有の並び順を自動保存する
    // selectedGenre を渡すことで他ジャンルの sortOrder には影響を与えない
    const result = await updateTagsSortOrderAction(selectedGenre, newTags.map((t) => t.id));
    setStatusMessage(result?.error ?? '並び順を保存しました');
  };

  const handleSaved = (updated: TagItem) => {
    // タグ情報（名前・画像）は tags_table で管理されており全ジャンルで共通
    // 現在のジャンルだけ更新すると、他ジャンルで同じタグを開いたときに古い情報が表示されてしまう
    // そのため全ジャンルのリストを走査して同じ id のタグをまとめて差し替える
    setTagsByGenre((prev) => {
      const next = { ...prev };
      for (const g of Object.keys(next) as GenreTab[]) {
        next[g] = next[g].map((t) => (t.id === updated.id ? updated : t));
      }
      return next;
    });
    setStatusMessage(`「${updated.name}」を更新しました`);
  };

  const handleRemovedFromGenre = (id: string) => {
    const removed = currentTags.find((t) => t.id === id);
    updateCurrentTags((prev) => prev.filter((t) => t.id !== id));
    if (removed) setStatusMessage(`「${removed.name}」をこのジャンルから除外しました`);
  };

  const handleDeleted = (id: string) => {
    // 完全削除は DB 上の tags_table 本体を削除するため、全ジャンルから除去する
    // handleSaved と同様の理由で全ジャンルを走査して同じ id のタグを除外する
    const removed = currentTags.find((t) => t.id === id);
    setTagsByGenre((prev) => {
      const next = { ...prev };
      for (const g of Object.keys(next) as GenreTab[]) {
        next[g] = next[g].filter((t) => t.id !== id);
      }
      return next;
    });
    if (removed) setStatusMessage(`「${removed.name}」を完全に削除しました`);
  };

  const handleCreated = (tag: TagItem) => {
    updateCurrentTags((prev) => [...prev, tag]);
    setStatusMessage(`「${tag.name}」を追加しました`);
  };

  const handleAddedFromOtherGenre = (tag: TagItem) => {
    updateCurrentTags((prev) => [...prev, tag]);
    setIsPickerOpen(false);
    setStatusMessage(`「${tag.name}」をこのジャンルに追加しました`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
      {editingTag && (
        <TagEditModal
          tag={editingTag}
          genre={selectedGenre}
          onSaved={handleSaved}
          onRemovedFromGenre={handleRemovedFromGenre}
          onDeleted={handleDeleted}
          onClose={() => setEditingTag(null)}
        />
      )}

      {/* ジャンルタブ */}
      <div className="bg-[var(--inputcontainer)] flex items-center gap-1 p-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] w-fit">
        {GENRE_TABS.map(({ value, label }) => (
          <SquareButton
            key={value}
            state={selectedGenre === value ? 'Enabled' : 'Disabled'}
            onClick={() => { setSelectedGenre(value); setStatusMessage(null); }}
          >
            {label}
          </SquareButton>
        ))}
      </div>

      {isPickerOpen && (
        <OtherGenreTagPicker
          tags={otherGenreTags}
          genre={selectedGenre}
          onAdded={handleAddedFromOtherGenre}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

      {statusMessage && (
        <span className="text-sm text-[var(--successtext,#497d00)]">{statusMessage}</span>
      )}

      {/* 他ジャンルのタグを追加するボタン */}
      <div>
        <SquareButton state="Enabled" onClick={() => setIsPickerOpen(true)}>
          他ジャンルのタグを追加
        </SquareButton>
      </div>

      {/* タググリッド：画像ドラッグ→並び替え、タグ名クリック→編集モーダル */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentTags.map((t) => t.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3">
            {currentTags.map((tag) => (
              <SortableTagCard key={tag.id} tag={tag} onEdit={setEditingTag} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <TagCreateForm genre={selectedGenre} onCreated={handleCreated} />
    </div>
  );
}
