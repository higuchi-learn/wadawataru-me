'use client';

import React, { useState, useCallback, useRef } from 'react';
import EasyMDE from 'easymde';
import dynamic from 'next/dynamic';
import AdminHeader from '@/components/AdminHeader';
import TagLabel from '@/components/TagLabel';
import Card from '@/components/Card';
import ArticlePreview from '@/components/ArticlePreview';
import type { Genre } from '@/components/GenreAbout';
import { saveAsDraftAction, publishAction, archiveAction } from '@/app/admin/actions';
import 'easymde/dist/easymde.min.css';

const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

// ---- sub-components ----

type FormLabelProps = {
  name: string;
  required?: boolean;
  hint?: string;
};

function FormLabel({ name, required, hint }: FormLabelProps) {
  return (
    <div className="flex items-center gap-1 text-xs leading-4">
      <span className="text-black">{name}</span>
      {required && hint && <span className="text-[var(--error)]">({hint})</span>}
    </div>
  );
}

type InputFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  // 画像の貼り付けをサポートするため、onPasteイベントハンドラーを受け取る
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
};

function InputField({ label, required, hint, value, onChange, placeholder, multiline, onPaste }: InputFieldProps) {
  const inputClass =
    'bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-2 text-sm leading-5 w-full focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]';
  return (
    <div className="flex flex-col gap-0 p-1 w-full shrink-0">
      <FormLabel name={label} required={required} hint={hint} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} py-1 resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // 画像の貼り付けをサポートするため、onPasteイベントハンドラーをinput要素に渡す
          onPaste={onPaste}
          placeholder={placeholder}
          className={`${inputClass} h-7`}
        />
      )}
    </div>
  );
}

const MAX_TAGS = 5;

type TagsFieldProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

function TagsField({ tags, onChange }: TagsFieldProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed || tags.length >= MAX_TAGS || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="flex flex-col gap-0 p-1 w-full shrink-0">
      <FormLabel name="タグ" hint="最大5項目" />
      <div className="flex items-center gap-1 bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-1 min-h-8 w-full">
        <div className="flex gap-0.5 items-center flex-wrap flex-1 min-w-0 py-0.5">
          {tags.map((tag) => (
            <button key={tag} type="button" onClick={() => removeTag(tag)} title="クリックで削除" className="shrink-0">
              <TagLabel label={tag} />
            </button>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={tags.length === 0 ? 'タグを入力してEnter' : ''}
            className="flex-1 min-w-[80px] bg-transparent text-sm leading-5 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={addTag}
          disabled={tags.length >= MAX_TAGS}
          className="shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-sm shadow-sm text-lg leading-none hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---- BlogEditor ----

type PublishStatus = 'draft' | 'published' | 'archived';

export type ArticleInitialData = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  slug: string;
  content: string;
  publishStatus: PublishStatus;
  savedAt: string;
};

type Props = {
  genre: Genre;
  mode: 'create' | 'edit';
  initialData?: ArticleInitialData;
};

// 画像をアップロードしてURLを取得する関数
async function uploadImage(file: File): Promise<string | null> {
  // FormDataを作成してファイルを追加する
  const form = new FormData();
  // 画像ファイルをFormDataに追加する
  form.append('file', file);
  // /api/uploadエンドポイントにPOSTリクエストを送信して画像をアップロードする
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  // レスポンスが正常でない場合はnullを返す
  if (!res.ok) return null;4
  // レスポンスから画像のURLを取得して返す
  const { url } = (await res.json()) as { url: string };
  return url;
}

export default function BlogEditor({ genre, mode, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [publishStatus] = useState<PublishStatus>(initialData?.publishStatus ?? 'draft');
  const [savedAt] = useState(initialData?.savedAt ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mdeRef = useRef<EasyMDE | null>(null);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  // EasyMDEのインスタンスを取得するためのコールバック関数
  const handleGetMdeInstance = useCallback((mde: EasyMDE) => {
    // すでにインスタンスがセットされている場合は何もしない
    if (mdeRef.current) return;
    // インスタンスをrefに保存する
    mdeRef.current = mde;
    // Codemirrorのインスタンスを取得する
    const cm = mde.codemirror;

    // Codemirrorのpasteイベントを監視して、画像が貼り付けられたときにuploadImage関数を呼び出す
    cm.on('paste', (_: unknown, e: ClipboardEvent) => {
      // クリップボードからファイルを取得する
      const file = e.clipboardData?.files[0];
      // ファイルが存在しないか画像ファイルでない場合は何もしない
      if (!file?.type.startsWith('image/')) return;
      // 画像ファイルが貼り付けられた場合は、デフォルトの貼り付け処理をキャンセル
      e.preventDefault();
      // uploadImage関数を呼び出して画像をアップロードし、URLを取得する
      uploadImage(file).then((url) => {
        if (!url) return;
        // 画像のURLが取得できたら、Markdown形式でエディタに貼り付ける
        const cursor = cm.getDoc().getCursor();
        cm.getDoc().replaceRange(`![](${url})`, cursor);
      });
    });

    // Codemirrorのdropイベントを監視
    cm.on('drop', (_: unknown, e: DragEvent) => {
      // ドロップされたファイルを取得する
      const file = e.dataTransfer?.files[0];
      // ファイルが存在しないか画像ファイルでない場合は何もしない
      if (!file?.type.startsWith('image/')) return;
      // 画像ファイルがドロップされた場合は、デフォルトのドロップ処理をキャンセル
      e.preventDefault();
      // uploadImage関数を呼び出して画像をアップロードし、URLを取得する
      uploadImage(file).then((url) => {
        // URLが取得できない場合は何もしない
        if (!url) return;
        // 画像のURLが取得できたら、Markdown形式でエディタに貼り付ける
        const cursor = cm.getDoc().getCursor();
        cm.getDoc().replaceRange(`![](${url})`, cursor);
      });
    });
  }, []);

  const payload = () => ({
    id: initialData?.id,
    genre,
    slug,
    title,
    description,
    content,
    thumbnail,
    tags,
  });

  const handleSaveDraft = async () => {
    setError(null);
    setIsLoading(true);
    const result = await saveAsDraftAction(payload());
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setError(null);
    setIsLoading(true);
    const result = await publishAction({ ...payload(), wasAlreadyPublished: publishStatus === 'published' });
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initialData?.id) return;
    setError(null);
    setIsLoading(true);
    const result = await archiveAction({ id: initialData.id, genre, title, description, content, thumbnail });
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 px-1">
      <AdminHeader
        genre={genre}
        status={mode}
        publishStatus={publishStatus}
        savedAt={savedAt || undefined}
        isLoading={isLoading}
        onArchive={mode === 'edit' ? handleArchive : undefined}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      {error && (
        <div className="px-2 py-1 text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-sm shrink-0">{error}</div>
      )}

      <div className="flex gap-1 items-start w-full shrink-0 bg-white pb-1">
        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField label="タイトル" required hint="必須・最大27字" value={title} onChange={setTitle} />
          <InputField
            label="説明"
            required
            hint="必須・最大62字"
            value={description}
            onChange={setDescription}
            multiline
          />
          <TagsField tags={tags} onChange={setTags} />
          <InputField
            label="サムネイル画像"
            value={thumbnail}
            onChange={setThumbnail}
            placeholder="サムネイル画像をペースト"
            // InputフィールドにonPasteイベントハンドラーを渡して、画像の貼り付けをサポートする
            onPaste={async (e) => {
              const file = e.clipboardData.files[0];
              if (!file?.type.startsWith('image/')) return;
              e.preventDefault();
              const url = await uploadImage(file);
              if (url) setThumbnail(url);
            }}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField label="URLパス" required hint="必須・最大20字" value={slug} onChange={setSlug} />
          <div className="p-1">
            <p className="text-xs leading-4 text-black mb-0.5">カードプレビュー</p>
            <div className="pointer-events-none">
              <Card
                title={title || 'タイトル'}
                description={description || '説明'}
                tags={tags}
                thumbnailUrl={thumbnail || undefined}
                publishedAt="----年--月--日"
                updatedAt="----年--月--日"
                href="#"
                className="w-full sm:w-[500px] md:w-[600px] lg:w-[500px] xl:w-[600px] 2xl:w-[700px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-3 pb-1 bg-white">
        <div className="w-1/2 pl-1 flex flex-col h-full overflow-hidden">
          <SimpleMdeReact
            value={content}
            onChange={handleContentChange}
            getMdeInstance={handleGetMdeInstance}
            options={{ spellChecker: false }}
            className="h-full flex flex-col"
          />
        </div>

        <div className="w-1/2 pr-1 overflow-auto border border-[var(--inputborder,#9f9fa9)] rounded-sm">
          <ArticlePreview title={title} description={description} tags={tags} content={content} />
        </div>
      </div>
    </div>
  );
}
