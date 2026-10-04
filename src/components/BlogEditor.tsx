'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import EasyMDE from 'easymde';
import dynamic from 'next/dynamic';
import { unstable_rethrow } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import TagLabel from '@/components/TagLabel';
import TagSelectOverlay, { type TagItem } from '@/components/TagSelectOverlay';
import { FormLabel, InputField } from '@/components/InputField';
import Card from '@/components/Card';
import ArticlePreview from '@/components/ArticlePreview';
import type { Genre } from '@/components/GenreAbout';
import { saveAsDraftAction, publishAction, archiveAction } from '@/app/admin/actions';
import { articleSchema } from '@/lib/schemas';
import { uploadImage, attachImageUpload } from '@/lib/uploadImage';
import 'easymde/dist/easymde.min.css';

// dynamic import + { ssr: false } でクライアントサイドのみで読み込む
// EasyMDE は DOM（document / window）に依存しているため SSR 時に実行すると
// "document is not defined" エラーになる。ssr: false を指定することで
// サーバーでのレンダリングをスキップし、ブラウザでのみ動作させる
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

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
  // このジャンルに登録済みのタグ一覧
  availableTags?: TagItem[];
  // 他ジャンルにあってこのジャンル未登録のタグ一覧（オーバーレイから追加できる）
  otherGenreTags?: TagItem[];
};

type FieldErrors = Partial<Record<'title' | 'description' | 'slug' | 'content', string>>;

export default function BlogEditor({ genre, mode, initialData, availableTags = [], otherGenreTags = [] }: Props) {
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
  const [isTagOverlayOpen, setIsTagOverlayOpen] = useState(false);
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

    // 画像の貼り付け・ドロップで R2 にアップロードし、本文に画像記法を挿入する
    attachImageUpload(mde, setContent, setServerError);
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

  // Card / ArticlePreview は { name, imageUrl } の形を要求するため
  // 選択中のタグ名（tags: string[]）を availableTags から画像を引いてオブジェクト化する
  const tagObjects = tags.map((name) => ({
    name,
    imageUrl: availableTags.find((t) => t.name === name)?.imageUrl ?? null,
  }));

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
        // 直前の if で配列を入れているため、TypeScript は messagesMap[field] が存在すると推論できている
        // （以前ここにあった ! による非 null アサーションは型を変えない無意味なものだった）
        messagesMap[field].push(issue.message);
      }
      const errors: FieldErrors = {};
      for (const [field, messages] of Object.entries(messagesMap) as [keyof FieldErrors, string[]][]) {
        // 必須エラーがある場合はそれだけ表示、それ以外は「・」で結合
        // 空欄のときに「文字数超過」も一緒に出ると混乱するため優先度で絞る
        errors[field] = messages.includes('この要素は必須です。') ? 'この要素は必須です。' : messages.join('・ ');
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
    // Server Action は通信エラーなどで例外を投げることがある（戻り値の { error } とは別の経路）
    // try/catch がないと例外が誰にも受け取られず、setIsLoading(false) に届かないためボタンが「処理中」のまま固まる
    try {
      const result = await saveAsDraftAction(payload());
      if (result?.error) {
        if (result.error.includes('URLパス')) {
          setFieldErrors({ slug: result.error });
        } else {
          setServerError(result.error);
        }
      }
    } catch (e) {
      // Server Action 内の redirect() は「NEXT_REDIRECT」という特殊な例外を投げて画面遷移を実現している
      // これを catch で握りつぶすと遷移しなくなるため、unstable_rethrow で Next.js 内部の例外だけ投げ直す
      // （Next.js 内部の例外でなければ何もせず、下のエラー表示に進む）
      unstable_rethrow(e);
      setServerError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      // 成功時は redirect() でアンマウントされるため基本的に意味はないが、
      // finally に置くことで成功・失敗・例外のどの経路でもローディング状態が必ず解除される
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
    try {
      const result = await publishAction({ ...payload(), wasAlreadyPublished: publishStatus === 'published' });
      if (result?.error) {
        if (result.error.includes('URLパス')) {
          setFieldErrors({ slug: result.error });
        } else {
          setServerError(result.error);
        }
      }
    } catch (e) {
      unstable_rethrow(e);
      setServerError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initialData?.id) return;
    // アーカイブすると公開ページから記事が消えるので、押し間違いに備えて実行前に確認する（年表の削除などと同じく window.confirm）
    if (
      !window.confirm(`「${title}」をアーカイブします。公開中の場合は公開ページから見えなくなります。よろしいですか？`)
    )
      return;
    setServerError(null);
    setIsLoading(true);
    try {
      const result = await archiveAction({ id: initialData.id, genre, title, description, content, thumbnail });
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (e) {
      unstable_rethrow(e);
      setServerError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // サムネイル欄への画像ペーストでアップロードする
  // e.preventDefault() は最初の await より前に呼ぶ。await の後ではブラウザの既定動作（貼り付け）がすでに走っている
  const handleThumbnailPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const file = e.clipboardData.files[0];
    if (!file?.type.startsWith('image/')) return;
    e.preventDefault();
    try {
      const url = await uploadImage(file);
      if (url) setThumbnail(url);
    } catch {
      // fetch や res.json() が例外をスローした場合（ネットワークエラー・不正レスポンスなど）
      // try/catch がないと unhandled rejection になるためここで捕捉してエラー表示する
      setServerError('画像のアップロードに失敗しました');
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
        // AdminHeader の props は () => void 型。async 関数をそのまま渡すと返した Promise が放置されるため、
        // void を付けて「Promise を意図的に待たない（エラーは各ハンドラー内で処理済み）」ことを明示する
        onArchive={mode === 'edit' ? () => void handleArchive() : undefined}
        onSaveDraft={() => void handleSaveDraft()}
        onPublish={() => void handlePublish()}
      />

      {serverError && (
        // role="alert": 保存・削除の失敗を読み上げソフトにもすぐ伝える
        <div role="alert" className="px-2 py-1 text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-sm shrink-0">
          {serverError}
        </div>
      )}

      <div className="flex gap-1 items-start w-full shrink-0 bg-white pb-1">
        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField
            label="タイトル"
            required
            hint="必須・最大27字"
            value={title}
            onChange={setTitle}
            error={fieldErrors.title}
          />
          <InputField
            label="説明"
            required
            hint="必須・最大62字"
            value={description}
            onChange={setDescription}
            multiline
            error={fieldErrors.description}
          />
          {/* タグ選択欄：タグはオーバーレイから選択する（テキスト直打ちは廃止） */}
          <div className="flex flex-col gap-0 p-1 w-full shrink-0">
            <FormLabel name="タグ" hint="最大5項目" />
            <div className="flex items-center gap-1 bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-sm px-1 min-h-8 w-full">
              <div className="flex gap-0.5 items-center flex-wrap flex-1 min-w-0 py-0.5">
                {tags.map((name) => {
                  const tagData = availableTags.find((t) => t.name === name);
                  return (
                    <TagLabel
                      key={name}
                      label={name}
                      imageUrl={tagData?.imageUrl}
                      onRemove={() => setTags(tags.filter((t) => t !== name))}
                    />
                  );
                })}
              </div>
              {/* ＋ボタンでオーバーレイを開く */}
              <button
                type="button"
                onClick={() => setIsTagOverlayOpen(true)}
                className="shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-sm shadow-sm text-lg leading-none hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          {isTagOverlayOpen && (
            <TagSelectOverlay
              tags={availableTags}
              selectedNames={tags}
              genre={genre}
              otherGenreTags={otherGenreTags}
              onConfirm={(names) => {
                setTags(names);
                setIsTagOverlayOpen(false);
              }}
              onClose={() => setIsTagOverlayOpen(false)}
            />
          )}
          <InputField
            label="サムネイル画像"
            value={thumbnail}
            onChange={setThumbnail}
            placeholder="サムネイル画像をペースト"
            // InputフィールドにonPasteイベントハンドラーを渡して、画像の貼り付けをサポートする
            onPaste={(e) => void handleThumbnailPaste(e)}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 py-1">
          <InputField
            label="URLパス"
            required
            hint="必須・最大20字"
            value={slug}
            onChange={setSlug}
            error={fieldErrors.slug}
          />
          <div className="p-1">
            <p className="text-xs leading-4 text-black mb-0.5">カードプレビュー</p>
            <div className="pointer-events-none">
              <Card
                title={title || 'タイトル'}
                description={description || '説明'}
                tags={tagObjects}
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
          <div
            className={`flex-1 min-h-0 overflow-hidden border rounded-sm ${fieldErrors.content ? 'border-[var(--error)]' : 'border-transparent'}`}
          >
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
          <ArticlePreview title={title} description={description} tags={tagObjects} content={content} />
        </div>
      </div>
    </div>
  );
}
