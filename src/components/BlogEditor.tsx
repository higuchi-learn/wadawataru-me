'use client';

import { useState, useCallback } from 'react';
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
};

function InputField({ label, required, hint, value, onChange, placeholder, multiline }: InputFieldProps) {
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

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
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
