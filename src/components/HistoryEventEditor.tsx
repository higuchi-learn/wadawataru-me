'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import EasyMDE from 'easymde';
import dynamic from 'next/dynamic';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormLabel, InputField } from '@/components/InputField';
import HistoryEventCard from '@/components/HistoryEventCard';
import {
  saveHistoryEventAction,
  deleteHistoryEventAction,
  createHistoryBadgeAction,
} from '@/app/admin/history-actions';
import { historyEventSchema, type HistoryEventInput } from '@/lib/schemas';
import { HISTORY_ERAS, HISTORY_KINDS } from '@/lib/history';
import { uploadImage, attachImageUpload } from '@/lib/uploadImage';
import 'easymde/dist/easymde.min.css';

// EasyMDE は DOM に依存しているため SSR をスキップしてブラウザでのみ読み込む（BlogEditor と同じ理由）
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export type HistoryBadgeOption = { id: string; name: string };

type Props = {
  id?: string;
  initialData?: HistoryEventInput;
  savedAt?: string;
  // 登録済みのラベル一覧（プルダウンの選択肢）
  badges: HistoryBadgeOption[];
};

type FieldErrors = Partial<Record<keyof HistoryEventInput, string>>;

const EMPTY: HistoryEventInput = {
  era: 'university',
  sortDate: '',
  dateLabel: '',
  kind: 'life',
  badgeId: '',
  title: '',
  summary: '',
  content: '',
  thumbnail: '',
};

const selectClass =
  'bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 text-sm leading-5 w-full h-7 focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]';

const buttonClass =
  'flex items-center justify-center px-2 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm leading-7 whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-40 disabled:pointer-events-none';

export default function HistoryEventEditor({ id, initialData, savedAt, badges: initialBadges }: Props) {
  const [form, setForm] = useState<HistoryEventInput>(initialData ?? EMPTY);
  // エディタ上で新しいラベルを追加したら、ページを再読み込みせずに選択肢へ反映するため state で持つ
  const [badges, setBadges] = useState(initialBadges);
  // null のときは「新しいラベルを追加」の入力欄を閉じている
  const [newBadgeName, setNewBadgeName] = useState<string | null>(null);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mdeRef = useRef<EasyMDE | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set =
    <K extends keyof HistoryEventInput>(key: K) =>
    (value: HistoryEventInput[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  // options を毎回新しい参照にすると EasyMDE が再初期化されるため useMemo で固定する（BlogEditor と同じ理由）
  const mdeOptions = useMemo(
    () => ({
      spellChecker: false,
      placeholder: '詳細ページに表示する本文（任意）。画像は貼り付け・ドロップでアップロードできます',
    }),
    [],
  );

  const handleContentChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, content: value }));
  }, []);

  const handleGetMdeInstance = useCallback((mde: EasyMDE) => {
    if (mdeRef.current) return;
    mdeRef.current = mde;
    attachImageUpload(mde, (value) => setForm((prev) => ({ ...prev, content: value })), setServerError);
  }, []);

  const setThumbnailFromFile = async (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return;
    try {
      const url = await uploadImage(file);
      if (url) set('thumbnail')(url);
      else setServerError('画像のアップロードに失敗しました');
    } catch {
      setServerError('画像のアップロードに失敗しました');
    }
  };

  const handleAddBadge = async () => {
    if (newBadgeName === null) return;
    setBadgeError(null);
    const result = await createHistoryBadgeAction(newBadgeName);
    if ('error' in result) {
      setBadgeError(result.error);
      return;
    }
    // 名前順で並べておくと、ラベルが増えてもプルダウンから探しやすい
    setBadges((prev) => [...prev, result.badge].sort((a, b) => a.name.localeCompare(b.name, 'ja')));
    set('badgeId')(result.badge.id);
    setNewBadgeName(null);
  };

  const validate = (): FieldErrors | null => {
    const parsed = historyEventSchema.safeParse(form);
    if (parsed.success) return null;
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof HistoryEventInput;
      // 必須エラーを優先して表示する（空欄のときに他のエラーも並ぶと分かりにくいため）
      if (!errors[field] || issue.message === 'この要素は必須です。') errors[field] = issue.message;
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setServerError(null);
    setIsLoading(true);
    const result = await saveHistoryEventAction(id, form);
    if (result?.error) setServerError(result.error);
    // 成功時は redirect() でアンマウントされるが、リダイレクトしなかった場合にローディング状態が残らないようにする
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm(`「${form.title}」を削除します。元に戻せませんがよろしいですか？`)) return;
    setServerError(null);
    setIsLoading(true);
    const result = await deleteHistoryEventAction(id);
    if (result?.error) setServerError(result.error);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 px-1">
      <div className="flex h-10 items-center justify-between w-full bg-white shrink-0">
        <span className="text-2xl font-bold leading-8 text-black px-1 whitespace-nowrap">
          {id ? '年表の出来事を編集' : '年表に出来事を追加'}
        </span>
        <div className="flex items-center gap-1.5 p-1">
          {savedAt && (
            <span className="text-sm leading-5 whitespace-nowrap text-[var(--successtext,#497d00)]">
              最終保存日時 : {savedAt}
            </span>
          )}
          {id && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isLoading}
              className={`${buttonClass} !text-[var(--error)] hover:!bg-[var(--error-bg)]`}
            >
              削除する
            </button>
          )}
          <button type="button" onClick={() => void handleSave()} disabled={isLoading} className={buttonClass}>
            {isLoading ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="px-2 py-1 text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-sm shrink-0">
          {serverError}
        </div>
      )}

      <div className="flex gap-1 items-start w-full shrink-0 bg-white pb-1">
        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField
            label="タイトル"
            required
            hint="必須・最大40字"
            value={form.title}
            onChange={set('title')}
            error={fieldErrors.title}
          />
          <InputField
            label="概要（年表に表示）"
            hint="最大120字"
            value={form.summary}
            onChange={set('summary')}
            multiline
            error={fieldErrors.summary}
          />
          <div className="flex">
            <InputField
              label="表示用の日付"
              required
              hint="必須・最大20字"
              value={form.dateLabel}
              onChange={set('dateLabel')}
              placeholder="例: 2021年4月 / 中学時代 / 2025年夏"
              error={fieldErrors.dateLabel}
            />
            <div className="flex flex-col gap-0 p-1 w-full">
              <FormLabel name="ラベル" error={badgeError ?? fieldErrors.badgeId} />
              {newBadgeName === null ? (
                <div className="flex items-center gap-1">
                  <select value={form.badgeId} onChange={(e) => set('badgeId')(e.target.value)} className={selectClass}>
                    <option value="">ラベルなし</option>
                    {badges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setNewBadgeName('')} className={`${buttonClass} h-7`}>
                    ＋新規
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newBadgeName}
                    onChange={(e) => setNewBadgeName(e.target.value)}
                    onKeyDown={(e) => {
                      // IME の変換確定の Enter では追加しない
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void handleAddBadge();
                      }
                    }}
                    placeholder="新しいラベル名（最大10字）"
                    autoFocus
                    className={selectClass}
                  />
                  <button type="button" onClick={() => void handleAddBadge()} className={`${buttonClass} h-7`}>
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBadgeName(null);
                      setBadgeError(null);
                    }}
                    className={`${buttonClass} h-7`}
                  >
                    やめる
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-0 p-1 w-full">
            <FormLabel name="画像（年表に表示）" />
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => set('thumbnail')(e.target.value)}
                onPaste={(e) => {
                  const file = e.clipboardData.files[0];
                  if (!file?.type.startsWith('image/')) return;
                  e.preventDefault();
                  void setThumbnailFromFile(file);
                }}
                placeholder="画像をペースト、または右のボタンから選択"
                className="bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 text-sm leading-5 flex-1 min-w-0 h-7 focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void setThumbnailFromFile(e.target.files?.[0]);
                  // 同じファイルを選び直しても onChange が発火するようにリセットする
                  e.target.value = '';
                }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`${buttonClass} h-7`}>
                選択
              </button>
              {form.thumbnail && (
                <button type="button" onClick={() => set('thumbnail')('')} className={`${buttonClass} h-7`}>
                  外す
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 py-1">
          <div className="flex">
            <div className="flex flex-col gap-0 p-1 w-full">
              <FormLabel name="時代" required hint="必須" error={fieldErrors.era} />
              <select
                value={form.era}
                onChange={(e) => set('era')(e.target.value as HistoryEventInput['era'])}
                className={selectClass}
              >
                {HISTORY_ERAS.map((era) => (
                  <option key={era.value} value={era.value}>
                    {era.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-0 p-1 w-full">
              <FormLabel name="種類" required hint="必須" error={fieldErrors.kind} />
              <select
                value={form.kind}
                onChange={(e) => set('kind')(e.target.value as HistoryEventInput['kind'])}
                className={selectClass}
              >
                {HISTORY_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-0 p-1 w-full">
              <FormLabel name="並び順の基準日" required hint="必須" error={fieldErrors.sortDate} />
              <input
                type="date"
                value={form.sortDate}
                onChange={(e) => set('sortDate')(e.target.value)}
                className={selectClass}
              />
            </div>
          </div>
          <p className="px-1 text-xs leading-4 text-[var(--lighttext)]">
            年表は「並び順の基準日」の古い順に並びます。同じ日の出来事は登録順です。
          </p>
          <div className="p-1">
            <p className="text-xs leading-4 text-black mb-1">年表での表示プレビュー</p>
            <div className="pointer-events-none border border-[var(--unclickable)] rounded-sm p-3">
              <HistoryEventCard
                align="right"
                event={{
                  dateLabel: form.dateLabel || '日付',
                  title: form.title || 'タイトル',
                  summary: form.summary || null,
                  kind: form.kind,
                  badge: badges.find((b) => b.id === form.badgeId)?.name ?? null,
                  thumbnail: form.thumbnail || null,
                  hasDetail: form.content.trim() !== '',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-3 pb-1 bg-white">
        <div className="w-1/2 pl-1 flex flex-col h-full overflow-hidden">
          <FormLabel name="詳細（Markdown・任意。書くと詳細ページへのリンクが表示されます）" />
          <div className="flex-1 min-h-0 overflow-hidden">
            <SimpleMdeReact
              value={form.content}
              onChange={handleContentChange}
              getMdeInstance={handleGetMdeInstance}
              options={mdeOptions}
              className="h-full flex flex-col"
            />
          </div>
        </div>

        <div className="w-1/2 pr-1 overflow-auto border border-[var(--inputborder,#9f9fa9)] rounded-sm">
          <div className="markdown-preview max-w-3xl mx-auto px-4 py-6">
            <Markdown remarkPlugins={[remarkGfm]}>{form.content || '*詳細ページの本文がここに表示されます*'}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
