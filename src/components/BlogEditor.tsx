'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import EasyMDE from 'easymde';
import dynamic from 'next/dynamic';
import AdminHeader from '@/components/AdminHeader';
import TagLabel from '@/components/TagLabel';
import Card from '@/components/Card';
import ArticlePreview from '@/components/ArticlePreview';
import type { Genre } from '@/components/GenreAbout';
import { saveAsDraftAction, publishAction, archiveAction } from '@/app/admin/actions';
import { articleSchema } from '@/lib/schemas';
import 'easymde/dist/easymde.min.css';

// dynamic import + { ssr: false } でクライアントサイドのみで読み込む
// EasyMDE は DOM（document / window）に依存しているため SSR 時に実行すると
// "document is not defined" エラーになる。ssr: false を指定することで
// サーバーでのレンダリングをスキップし、ブラウザでのみ動作させる
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

// ---- sub-components ----

type FormLabelProps = {
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

function FormLabel({ name, required, hint, error }: FormLabelProps) {
  return (
    <div className="flex items-center gap-1 text-xs leading-4">
      <span className="text-black">{name}</span>
      {error ? (
        <span className="text-[var(--error)]">{error}</span>
      ) : (
        required && hint && <span className="text-[var(--error)]">({hint})</span>
      )}
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
  error?: string;
};

function InputField({ label, required, hint, value, onChange, placeholder, multiline, onPaste, error }: InputFieldProps) {
  const borderClass = error ? 'border-[var(--error)]' : 'border-[var(--inputborder,#9f9fa9)]';
  const inputClass = `bg-[var(--inputcontainer)] border ${borderClass} rounded-sm shadow-sm px-2 text-sm leading-5 w-full focus:outline-none focus:ring-1 focus:ring-[var(--ogangetext)]`;
  return (
    <div className="flex flex-col gap-0 p-1 w-full shrink-0">
      <FormLabel name={label} required={required} hint={hint} error={error} />
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
  thumbnail: string | null;
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

type FieldErrors = Partial<Record<'title' | 'description' | 'slug' | 'content', string>>;

// 画像をアップロードしてURLを取得する関数
async function uploadImage(file: File): Promise<string | null> {
  // FormDataを作成してファイルを追加する
  const form = new FormData();
  // 画像ファイルをFormDataに追加する
  form.append('file', file);
  // /api/uploadエンドポイントにPOSTリクエストを送信して画像をアップロードする
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  // レスポンスが正常でない場合はnullを返す
  if (!res.ok) return null;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // useRef で EasyMDE のインスタンスを保持する
  // useState と違い ref への代入は再レンダリングを引き起こさない
  // また ref の値はレンダリングをまたいでも保持され続けるため、インスタンスの保持に適している
  const mdeRef = useRef<EasyMDE | null>(null);

  // useMemo で options オブジェクトを記憶する
  // {} はレンダリングのたびに新しい参照になるため、SimpleMdeReact に渡すと
  // options が変わったと判断されて EasyMDE が再初期化されてしまう
  // useMemo + [] で初回だけ生成することで同じ参照を使い回せる
  const mdeOptions = useMemo(() => ({ spellChecker: false }), []);

  // useCallback で関数の参照を固定する
  // [] 依存配列にすることで初回だけ関数を生成し、以降は同じ参照を返す
  // SimpleMdeReact の onChange に渡す関数が変わると不要な再レンダリングが起きるため
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  // getMdeInstance は SimpleMdeReact が EasyMDE の初期化を完了したタイミングで
  // インスタンスを渡してくれるコールバック。ここで CodeMirror のイベントを登録する
  // useCallback + [] で関数参照を固定し、不要な再登録を防ぐ
  const handleGetMdeInstance = useCallback((mde: EasyMDE) => {
    // すでにインスタンスがセットされている場合は何もしない
    if (mdeRef.current) return;
    // インスタンスをrefに保存する
    mdeRef.current = mde;

    // EasyMDE の内部は CodeMirror エディタで動いている
    // mde.codemirror でその CodeMirror インスタンスを取得できる
    const cm = mde.codemirror;

    const insertImage = (file: File) => {
      uploadImage(file)
        .then((url) => {
          if (!url) {
            setServerError('画像のアップロードに失敗しました');
            return;
          }
          // cm.replaceSelection() でカーソル位置にテキストを挿入する
          // Markdown の画像記法 ![alt](url) を埋め込む
          cm.replaceSelection(`![](${url})`);
          // CodeMirror の値は React の state と連動していないため
          // cm.getValue() で最新テキストを取り出して state に同期する
          setContent(cm.getValue());
        })
        .catch(() => setServerError('画像のアップロードに失敗しました'));
    };

    // cm.on() で CodeMirror のネイティブイベントを購読する
    // 第1引数はイベント名、第2引数はコールバック（第1引数はエディタ本体、第2引数はネイティブイベント）
    cm.on('paste', (_: unknown, e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      // 画像以外（テキストなど）はデフォルトの貼り付け動作に任せる
      if (!file?.type.startsWith('image/')) return;
      // e.preventDefault() でブラウザのデフォルト貼り付け処理を止める
      // これをしないと画像バイナリがそのままエディタに入力されてしまう
      e.preventDefault();
      insertImage(file);
    });

    cm.on('drop', (_: unknown, e: DragEvent) => {
      const file = e.dataTransfer?.files[0];
      if (!file?.type.startsWith('image/')) return;
      e.preventDefault();
      insertImage(file);
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

  const validate = (): FieldErrors | null => {
    // safeParse はエラーを例外でなく戻り値として返すため、try/catch 不要
    const parsed = articleSchema.safeParse({ title, description, slug, content });
    if (!parsed.success) {
      // parsed.error.issues は「1フィールドに複数エラーが起きうる」配列形式で返ってくる
      // 例: slug に「必須エラー」と「文字数エラー」が同時に起きることがある
      // まず issue.path[0]（フィールド名）をキーに、エラーメッセージを配列で集約する
      const messagesMap: Partial<Record<keyof FieldErrors, string[]>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!messagesMap[field]) messagesMap[field] = [];
        messagesMap[field]!.push(issue.message);
      }
      const errors: FieldErrors = {};
      for (const [field, messages] of Object.entries(messagesMap) as [keyof FieldErrors, string[]][]) {
        // 必須エラーがある場合はそれだけ表示、それ以外は「・」で結合
        // 空欄のときに「文字数超過」も一緒に出ると混乱するため優先度で絞る
        errors[field] = messages.includes('この要素は必須です。')
          ? 'この要素は必須です。'
          : messages.join('・ ');
      }
      return errors;
    }
    return null;
  };

  const handleSaveDraft = async () => {
    // クライアント側バリデーションを先に走らせることで
    // 明らかなエラーをサーバーへのリクエストなしに即座に表示できる
    const errors = validate();
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setServerError(null);
    setIsLoading(true);
    const result = await saveAsDraftAction(payload());
    if (result?.error) {
      if (result.error.includes('URLパス')) {
        setFieldErrors({ slug: result.error });
      } else {
        setServerError(result.error);
      }
      // エラー時のみ setIsLoading(false) を呼ぶ
      // 成功時は Server Action 内の redirect() がページ遷移するため
      // このコンポーネント自体がアンマウントされ、state のリセットは不要
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    const errors = validate();
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setServerError(null);
    setIsLoading(true);
    const result = await publishAction({ ...payload(), wasAlreadyPublished: publishStatus === 'published' });
    if (result?.error) {
      if (result.error.includes('URLパス')) {
        setFieldErrors({ slug: result.error });
      } else {
        setServerError(result.error);
      }
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initialData?.id) return;
    setServerError(null);
    setIsLoading(true);
    const result = await archiveAction({ id: initialData.id, genre, title, description, content, thumbnail });
    if (result?.error) {
      setServerError(result.error);
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

      {serverError && (
        <div className="px-2 py-1 text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-sm shrink-0">{serverError}</div>
      )}

      <div className="flex gap-1 items-start w-full shrink-0 bg-white pb-1">
        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField label="タイトル" required hint="必須・最大27字" value={title} onChange={setTitle} error={fieldErrors.title} />
          <InputField
            label="説明"
            required
            hint="必須・最大62字"
            value={description}
            onChange={setDescription}
            multiline
            error={fieldErrors.description}
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
          <InputField label="URLパス" required hint="必須・最大20字" value={slug} onChange={setSlug} error={fieldErrors.slug} />
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
          <FormLabel name="本文" required hint="必須" error={fieldErrors.content} />
          <div className={`flex-1 min-h-0 overflow-hidden border rounded-sm ${fieldErrors.content ? 'border-[var(--error)]' : 'border-transparent'}`}>
            <SimpleMdeReact
              value={content}
              onChange={handleContentChange}
              getMdeInstance={handleGetMdeInstance}
              options={mdeOptions}
              className="h-full flex flex-col"
            />
          </div>
        </div>

        <div className="w-1/2 pr-1 overflow-auto border border-[var(--inputborder,#9f9fa9)] rounded-sm">
          <ArticlePreview title={title} description={description} tags={tags} content={content} />
        </div>
      </div>
    </div>
  );
}
