# 実装ドキュメント

このドキュメントは、プロジェクトの各機能について「なぜそれが必要か」「なぜそれで動くか」を説明します。

---

## 目次

- [動作フロー例：記事を新規作成し、本文を修正する](#動作フロー例記事を新規作成し本文を修正する)

1. [データベース層](#1-データベース層)
   - [スキーマ設計](#11-スキーマ設計)
   - [DB クライアント](#12-db-クライアント)
   - [クエリ関数](#13-クエリ関数)
2. [ルーティング設計](#2-ルーティング設計)
   - [公開ページ](#21-公開ページ)
   - [管理画面](#22-管理画面)
   - [レイアウトの分離](#23-レイアウトの分離)
3. [公開ページの機能](#3-公開ページの機能)
   - [記事一覧ページ](#31-記事一覧ページ)
   - [記事詳細ページ](#32-記事詳細ページ)
   - [タグフィルタ・検索](#33-タグフィルタ検索)
   - [ページネーション](#34-ページネーション)
   - [目次の自動生成](#35-目次の自動生成)
4. [管理画面の機能](#4-管理画面の機能)
   - [記事一覧（管理用）](#41-記事一覧管理用)
   - [記事の作成・編集エディタ](#42-記事の作成編集エディタ)
   - [Server Actions による書き込み](#43-server-actions-による書き込み)
   - [タグの同期](#44-タグの同期)

---

## 1. データベース層

### 1.1 スキーマ設計

**ファイル**: `src/db/schema.ts`

#### テーブル構成

```
posts_table          記事本体
tags_table           タグ（全ジャンル共通）
post_tags_table      記事とタグの中間テーブル（多対多）
```

#### なぜ3テーブルに分けているか

1つの記事は複数のタグを持ち、1つのタグは複数の記事に付く（多対多の関係）。
RDB で多対多を表現するには中間テーブルが必要。`posts_table` に直接タグを持たせると、
タグが増えるたびにカラムを追加するか、配列で持つことになり、検索・変更が難しくなる。

#### genre と status を enum にしている理由

```ts
export const articlesGenreEnum = pgEnum("articles_genre_enum", ["blogs", "products", "books"]);
export const articlesStatusEnum = pgEnum("articles_status_enum", ["draft", "published", "archived"]);
```

DB 側で値の種類を制約することで、無効な値（例: `"Blog"` や `"publshed"`）が
誤って挿入されることを防ぐ。アプリ側だけでバリデーションするより確実。

#### tags_table に sort_order がある理由

```ts
sortOrder: integer("sort_order").notNull().default(0)
```

タグをフィルタバーに表示するとき、追加順ではなく任意の順序で並べられるようにするため。
将来的にタグの表示順を管理画面から変更できる機能を想定している。

#### posts_table に createdAt・updatedAt・publishedAt の3つの日時がある理由

| カラム | 意味 |
|--------|------|
| `created_at` | 記事を最初に作成した日時（変わらない） |
| `updated_at` | 最後に保存した日時（保存のたびに更新） |
| `published_at` | 最初に公開した日時（初回公開時のみセット） |

公開日として表示したいのは「いつ公開したか」であり、
その後に内容を編集して再保存しても公開日は変わらないようにするために3つ分けている。

---

### 1.2 DB クライアント

**ファイル**: `src/db/db.ts`

```ts
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

#### なぜ Neon（サーバーレス PostgreSQL）を使うか

このプロジェクトは Cloudflare Pages にデプロイする。
Cloudflare の実行環境は通常の Node.js サーバーではなく Edge Runtime であり、
TCP 接続を維持し続ける一般的な PostgreSQL クライアントが使えない。
Neon の HTTP ドライバはリクエストごとに HTTP で DB に接続するため、
Edge Runtime でも動作する。

#### なぜ `process.env.DATABASE_URL!` と `!` を付けるか

TypeScript は `process.env.xxx` の型を `string | undefined` と推論する。
`!` を付けることで「この環境変数は必ず存在する」とコンパイラに伝え、
型エラーを回避している。実際には `.env` ファイルまたはホスティング側の環境変数で設定が必要。

---

### 1.3 クエリ関数

**ファイル**: `src/db/queries/select.ts`, `insert.ts`, `update.ts`, `delete.ts`

#### `getPostsList` がタグフィルタの有無で2つのクエリに分かれている理由

```ts
// タグ検索なし → LEFT JOIN
// タグ検索あり → INNER JOIN + HAVING
```

タグを持たない記事もタグなしで検索結果に表示したいが、
タグ検索時にはそもそもタグを持たない記事は不要。

LEFT JOIN はタグを持たない記事も返すが、HAVING 句で「選択したタグを全て持つ」
という絞り込みをすると、タグなし記事は件数0で弾かれる。
件数だけを計算する `getPostsCount` でも同じ分岐が必要なのでどちらも揃っている。

#### `getPostsList` で `array_agg` を使っている理由

```sql
coalesce(array_agg(distinct tags_table.name) filter (where ...), '{}')
```

LEFT JOIN でタグと結合すると、タグの数だけ同じ記事が複数行返ってくる（行の爆発）。
`GROUP BY` で記事単位にまとめ、`array_agg` でタグ名を配列に集約することで、
1記事1行・タグは配列、というアプリが扱いやすい形に整形している。

#### `createPost` が `id` を返す理由

```ts
const result = await db.insert(postsTable).values(data).returning({ id: postsTable.id });
return result[0].id;
```

記事を作成した直後に `post_tags_table` へタグを紐付ける必要がある。
タグの紐付けには記事の UUID（`post_id`）が必須なので、
INSERT 直後に `.returning()` で ID を取得して呼び出し元に返す。

#### `updatePostById` に `publishedAt` をオプションで渡す理由

```ts
...(newPublishedAt !== undefined ? { publishedAt: newPublishedAt } : {})
```

「公開」ボタンは「初回公開」と「公開済み記事の再保存」の2種類で使われる。
初回公開時は `publishedAt` を現在時刻にセットする必要があるが、
再保存時は既存の `publishedAt`（最初の公開日時）を上書きしてはいけない。
`undefined` を渡した場合は SET 句に含めないため、DB の値がそのまま保持される。

#### `syncPostTags` が「全削除 → 再構築」する理由

```ts
await tx.delete(postTagsTable).where(eq(postTagsTable.postId, postId));
// ... 新しいタグを挿入
```

タグの変更には「追加」「削除」「変更なし」が混在する。
差分を計算して追加分だけ INSERT、削除分だけ DELETE するアプローチも正確だが、
実装が複雑になる。「現在渡したタグ名の配列が正」という前提で
全削除→再構築すれば、差分計算なしに常に正しい状態にできる。
トランザクション内で行うため、失敗時は全体がロールバックされ不整合は起きない。

#### `syncPostTags` がタグを自動作成する理由

```ts
const existing = await tx.select().from(tagsTable).where(eq(tagsTable.name, name));
if (existing.length === 0) {
  await tx.insert(tagsTable).values({ name, sortOrder: 0 });
}
```

エディタで新しいタグ名を入力したとき、`tags_table` に存在しなければ
先にタグを作成する必要がある。`post_tags_table` は `tags_table.id` への
外部キー制約を持っているため、存在しないタグ ID を参照しようとするとエラーになる。

---

## 2. ルーティング設計

### 2.1 公開ページ

```
/                        ホーム
/blog                    ブログ一覧
/blog/[slug]             ブログ詳細（slug = URL パス）
/products                制作物一覧
/products/[slug]         制作物詳細
/books                   読書記録一覧
/books/[slug]            読書記録詳細
```

#### 詳細ページの URL が slug である理由

公開ページの URL は人が読めるものが望ましく、SEO 的にも有利。
UUID（`550e8400-e29b-41d4-a716-446655440000`）より
`/blog/nextjs-app-router` のような slug の方が意味が伝わる。

---

### 2.2 管理画面

```
/admin/blog              ブログ管理一覧
/admin/blog/create       新規作成
/admin/blog/[id]         編集（[id] = UUID）
/admin/products          ...（products, books も同様）
```

#### 編集ページの URL が UUID である理由

slug は編集フォームで変更可能。
もし slug で編集ページを識別していると、slug を変更して保存した瞬間に
現在のページ URL が無効になる。UUID は変わらないため識別子として安全。

---

### 2.3 レイアウトの分離

**ファイル**: `src/app/(public)/layout.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/(list)/layout.tsx`

#### `(public)` と `admin` でレイアウトを分けている理由

公開ページと管理画面ではヘッダーの見た目・構造が異なる。
Next.js の Route Groups（括弧付きフォルダ名）を使うことで、
URL に影響を与えずにレイアウトを分けられる。

#### 管理画面の中で `(list)` レイアウトを別にしている理由

管理画面には2種類のページがある。

| ページ種別 | レイアウト |
|-----------|-----------|
| 一覧（`/admin/blog` など） | スクロール可・Header あり |
| エディタ（`/admin/blog/[id]`） | 画面全体固定・Header なし（エディタ内に AdminHeader） |

エディタは高さを `h-screen overflow-hidden` で固定し、
内部のみスクロールさせる UI なので、一覧とは異なるレイアウトが必要。
`(list)` グループを作ることでエディタページを除いた一覧だけに Header を適用できる。

---

## 3. 公開ページの機能

### 3.1 記事一覧ページ

**ファイル**: `src/components/PostListPage.tsx`

```ts
// genre が "blog" のとき DB の enum "blogs" に変換する
function toDbGenre(genre: Genre): SelectPost["genre"] {
  return genre === "blog" ? "blogs" : genre;
}
```

#### なぜ変換が必要か

コンポーネント側の `Genre` 型は `"blog"` だが、DB の enum は `"blogs"`（複数形）。
この不一致はスキーマ定義時に生まれたもので、変換関数を挟むことで
両者を別々に管理できる。

#### `Promise.all` で2クエリを並行実行している理由

```ts
const [posts, totalCount] = await Promise.all([
  getPostsList(...),
  getPostsCount(...),
]);
```

記事一覧と総件数（ページネーション用）は互いに依存しない。
`await` を順番に並べると直列実行になり合計待ち時間が増えるが、
`Promise.all` で並行実行することで待ち時間を短縮できる。

---

### 3.2 記事詳細ページ

**ファイル**: `src/components/PostDetailPage.tsx`

```ts
const post = await getPostById(slug);
if (!post) notFound();
```

#### `notFound()` を呼ぶ理由

Next.js の `notFound()` を呼ぶと、そのリクエストに対して 404 レスポンスを返す。
存在しない slug でアクセスされたときにエラーページを出すためのもの。
`null` チェックなしに `post.title` などにアクセスするとランタイムエラーになる。

---

### 3.3 タグフィルタ・検索

**ファイル**: `src/components/SearchBar.tsx`

```ts
const handleSearch = () => {
  params.set("tags", selectedTags.join(","));
  params.set("page", "1");
  router.push(`?${params.toString()}`);
};
```

#### タグを URL クエリパラメータ（`?tags=xxx,yyy`）で管理する理由

- ページをリロードしてもフィルタ状態が保持される
- URL を共有するとフィルタ済みの状態がそのまま共有できる
- ブラウザの戻るボタンでフィルタ解除ができる

#### 検索ボタンを押すまで反映しない理由

タグをクリックするたびに検索すると、DB クエリが頻繁に走りサーバー負荷が増える。
選択してから「検索」ボタンで一度だけ確定する設計にすることで、
不要なリクエストを防いでいる。

---

### 3.4 ページネーション

**ファイル**: `src/components/SelectPageBar.tsx`

```ts
const getPageNumbers = (): number[] => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, ...);
  // 現在ページを中心に最大5ページ分表示
  const half = 2;
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + 4);
  ...
};
```

#### ページ番号を最大5件に絞っている理由

記事数が多くなると全ページ番号を並べると UI が崩れる。
現在ページを中心に前後2ページ分だけ表示することで、
どれだけページ数が増えても一定のサイズに収まる。

#### ページ状態を URL（`?page=3`）で管理する理由

タグフィルタと同じ理由。リロード・URL 共有・ブラウザ戻るボタンへの対応のため。

---

### 3.5 目次の自動生成

**ファイル**: `src/lib/parseHeadings.ts`, `src/components/TableOfContents.tsx`, `src/components/ArticlePage.tsx`

#### 仕組み

1. `parseHeadings(content)` で Markdown テキストから見出し（`#`〜`######`）を正規表現で抽出
2. `generateHeadingId(text)` で見出しテキストから URL フラグメント用の ID を生成
3. `ArticlePage` が Markdown をレンダリングするとき、各見出しタグに同じ ID を付与
4. `TableOfContents` が生成した見出しリストをリンク（`href="#id"`）として表示

#### ID 生成の変換ルール

```ts
text
  .replace(/`[^`]*`/g, (m) => m.slice(1, -1))  // インラインコードのバッククォートを除去
  .toLowerCase()
  .replace(/\s+/g, "-")                          // スペースをハイフンに
  .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, "")  // 日本語・英数字・ハイフン以外を除去
  .replace(/-+/g, "-")                           // 連続ハイフンを1つに
  .replace(/^-|-$/g, "");                        // 先頭末尾のハイフンを除去
```

日本語の見出しにも対応するため、Unicode の平仮名・カタカナ・漢字の範囲を明示的に許可している。

#### `parseHeadings` と `ArticlePage` の中の `makeHeading` が同じ ID を生成している理由

目次のリンクをクリックしたとき、対応する見出しにスクロールするには
`href="#id"` と `id="..."` が完全に一致している必要がある。
両方で `generateHeadingId(text)` を呼ぶことで、同じテキストから同じ ID が生成されることを保証している。

---

## 4. 管理画面の機能

### 4.1 記事一覧（管理用）

**ファイル**: `src/components/AdminPostListPage.tsx`

#### 公開ページの `PostListPage` と分けている理由

| 項目 | 公開ページ | 管理画面 |
|------|-----------|---------|
| ステータスフィルタ | 常に `published` | `draft` / `published` / `archived` を切り替え可 |
| リンク先 | `/blog/[slug]`（公開URL） | `/admin/blog/[id]`（UUID ベース） |
| フィルタバー | タグのみ | タグ + ステータス |

同じ `getPostsList` クエリを使いつつ、表示・フィルタ・リンク先の違いを吸収するために別コンポーネントにしている。

---

### 4.2 記事の作成・編集エディタ

**ファイル**: `src/components/BlogEditor.tsx`

#### `"use client"` が必要な理由

エディタはユーザーの入力（タイトル・本文など）をリアルタイムに state で管理する。
`useState` はクライアントコンポーネントでのみ使えるため、`"use client"` が必須。

#### SimpleMDE を `dynamic` で読み込んでいる理由

```ts
const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), { ssr: false });
```

SimpleMDE はブラウザの DOM に依存しており、サーバーサイドレンダリング（SSR）時には
`window` や `document` が存在しないためエラーになる。
`ssr: false` を指定することで、サーバー側ではレンダリングをスキップし
クライアント側でのみ読み込む。

#### `handleContentChange` を `useCallback` でメモ化している理由

```ts
const handleContentChange = useCallback((value: string) => {
  setContent(value);
}, []);
```

SimpleMDE は `onChange` プロップが変わるたびにエディタを再マウントする挙動がある。
`useCallback` を使って関数を固定（メモ化）することで、
親コンポーネントが再レンダリングしても同じ関数参照を渡し続け、
エディタの不要な再マウントを防いでいる。

#### `ArticleInitialData` に `id?` がある理由

```ts
export type ArticleInitialData = {
  id?: string;   // undefined = create モード
  ...
}
```

`BlogEditor` は作成（create）と編集（edit）の両方で使う。
create 時はまだ DB に記録がないため ID が存在しない（`undefined`）。
edit 時は保存ボタンを押したときに「どの記事を更新するか」を Server Actions に伝えるために
UUID が必要なので、Server Component（`PostEditPage`）から `initialData.id` として渡している。

#### ボタン操作後にローカル state を更新している理由

```ts
const handleSaveDraft = async () => {
  await saveAsDraftAction(payload());
  if (initialData?.id) {
    setSavedAt(formatSavedAt(new Date()));
    setPublishStatus("draft");
  }
};
```

Server Actions の `revalidatePath` はサーバー側のキャッシュを無効化するが、
今まさに表示しているクライアントコンポーネントの state は変わらない。
保存成功後に「最終保存日時」や「公開中」バッジを即時更新するには
明示的に state をセットする必要がある。

---

### 4.3 Server Actions による書き込み

**ファイル**: `src/app/admin/actions.ts`

#### Server Actions が必要な理由

`BlogEditor` は `"use client"` なコンポーネントであり、
クライアント側のコードから直接 Drizzle ORM（DB 接続）を呼ぶことはできない。
DB 接続情報や秘密鍵がブラウザに露出してしまうためでもある。

`"use server"` を宣言した関数（Server Actions）は、
クライアントから呼ばれると Next.js が自動的に HTTP リクエストに変換してサーバーで実行する。
DB 操作はサーバー内で完結し、結果だけがクライアントに返る。

#### create と edit を同じ Action 関数で処理する理由

```ts
export async function saveAsDraftAction(payload: SavePayload) {
  if (!payload.id) {
    // INSERT
    redirect(`/admin/${genre}`);
  } else {
    // UPDATE
    revalidatePath(`/admin/${genre}/${id}`);
  }
}
```

エディタコンポーネント（`BlogEditor`）は create・edit 兼用なので、
Action 側も同じ関数内で分岐させることで、エディタとの対応を1対1にできる。
呼び出しコードがシンプルになる。

#### create 後に `redirect`、edit 後に `revalidatePath` を使い分ける理由

| 操作 | 処理 | 理由 |
|------|------|------|
| create | `redirect("/admin/genre")` | 記事作成後は一覧に戻るのが自然な UX のため |
| edit | `revalidatePath(...)` | 同じページに留まって編集を続けられるようにするため |

`redirect` は文字通りページ遷移を引き起こす。
`revalidatePath` はサーバー側のキャッシュを破棄するだけで、
ページ遷移は起きないためエディタの state も維持される。

---

### 4.4 タグの同期

`syncPostTags` の詳細は [1.3 クエリ関数](#13-クエリ関数) を参照。

create・edit どちらの場合も、保存と同時に `syncPostTags` を呼ぶことで
記事のタグを常に最新の状態に保つ。
create 時は `createPost` が返した UUID を、
edit 時は `initialData.id` を `postId` として渡す。

---

## 動作フロー例：記事を新規作成し、本文を修正する

---

### フェーズ1: 新規作成ページを開く

**操作**: 管理画面の一覧で「新規作成」ボタンをクリック

#### 1. `AdminSelectBar` のリンクをクリック

```tsx
// src/components/AdminSelectBar.tsx
<Link href={`/admin/${genre}/create`}>新規作成</Link>
```

`/admin/blog/create` に遷移する。

#### 2. Next.js がページを解決する

```
src/app/admin/blog/create/page.tsx
```

```tsx
export default function BlogCreatePage() {
  return <BlogEditor genre="blog" mode="create" />;
}
```

このページは Server Component。`BlogEditor` に `mode="create"` と `genre="blog"` を渡す。
`initialData` は渡さないので `undefined`。

#### 3. `BlogEditor` が初期 state を作る

```tsx
// src/components/BlogEditor.tsx
const [title, setTitle] = useState("");          // initialData?.title ?? ""
const [description, setDescription] = useState("");
const [tags, setTags] = useState<string[]>([]);
const [thumbnail, setThumbnail] = useState("");
const [slug, setSlug] = useState("");
const [content, setContent] = useState("");
const [publishStatus, setPublishStatus] = useState("draft");
const [savedAt, setSavedAt] = useState("");      // 空なので「----/--/-- | --:--:--」表示
```

全フィールドが空で画面が表示される。`initialData?.id` は `undefined`。

---

### フェーズ2: フォームに入力する

**操作**: タイトル・説明・slug・タグ・本文を入力

各 `InputField` の `onChange` が呼ばれるたびに対応する `setState` が走り、React が再レンダリングする。

```tsx
<InputField label="タイトル" value={title} onChange={setTitle} />
```

「カードプレビュー」は state を参照して表示しているので、
タイトルや説明を入力するたびにリアルタイムに更新される。

```tsx
<Card
  title={title || "タイトル"}        // 入力が空なら "タイトル" を表示
  description={description || "説明"}
  ...
/>
```

Markdown エディタへの入力は `handleContentChange` → `setContent` の流れ。
`handleContentChange` は `useCallback` でメモ化されているので、
再レンダリングのたびに SimpleMDE が再マウントされることなく入力を受け取り続ける。

右側のプレビューも `content` state を参照しているのでリアルタイムに Markdown がレンダリングされる。

---

### フェーズ3: 「下書き保存」をクリック

**操作**: AdminHeader の「下書き保存」ボタンをクリック

#### 1. `handleSaveDraft` が呼ばれる

```tsx
// src/components/BlogEditor.tsx
const payload = () => ({
  id: initialData?.id,   // undefined（create モード）
  genre,                 // "blog"
  slug,                  // 入力した slug
  title,
  description,
  content,
  thumbnail,
  tags,
});

const handleSaveDraft = async () => {
  await saveAsDraftAction(payload());
  if (initialData?.id) {   // undefined なので false → ここは実行されない
    ...
  }
};
```

#### 2. `saveAsDraftAction` がサーバーで実行される

```ts
// src/app/admin/actions.ts
export async function saveAsDraftAction(payload: SavePayload) {
  const { id, genre, slug, title, description, content, thumbnail, tags } = payload;
  const dbGenre = GENRE_DB_MAP[genre];  // "blog" → "blogs"

  if (!id) {   // id = undefined なので true → create ルート
    const postId = await createPost({
      genre: "blogs",
      slug,
      title,
      description,
      content,
      thumbnail: thumbnail || null,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await syncPostTags(postId, tags);
    redirect(`/admin/blog`);
  }
}
```

#### 3. `createPost` が DB に INSERT する

```ts
// src/db/queries/insert.ts
const result = await db
  .insert(postsTable)
  .values(data)
  .returning({ id: postsTable.id });
return result[0].id;   // 新しく採番された UUID が返る（例: "550e8400-..."）
```

PostgreSQL が UUID を自動生成（`defaultRandom()`）して `posts_table` に1行挿入。
返ってきた UUID を `postId` として受け取る。

#### 4. `syncPostTags` がタグを DB に書き込む

```ts
// src/db/queries/update.ts
await db.transaction(async (tx) => {
  // この時点では記事が新規なので削除するものは何もない
  await tx.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

  for (const name of tags) {
    // 同名タグが tags_table に存在するか確認
    const existing = await tx.select(...).from(tagsTable).where(eq(tagsTable.name, name));

    let tagId: string;
    if (existing.length > 0) {
      tagId = existing[0].id;       // 既存タグを使い回す
    } else {
      const created = await tx.insert(tagsTable).values({ name, sortOrder: 0 }).returning(...);
      tagId = created[0].id;        // 新しいタグを作成
    }

    // 記事とタグを中間テーブルで紐付け
    await tx.insert(postTagsTable).values({ postId, tagId });
  }
});
```

#### 5. `redirect("/admin/blog")` で一覧に戻る

Server Actions 内の `redirect()` は Next.js の NEXT_REDIRECT エラーを throw する。
Next.js がこれを捕捉してクライアントを `/admin/blog` に遷移させる。

`handleSaveDraft` の `if (initialData?.id)` が `false` なのでローカル state の更新は実行されない
（どうせページ遷移するので不要）。

---

### フェーズ4: 一覧ページから記事をクリックして編集ページを開く

**操作**: `/admin/blog` の一覧に表示された記事をクリック

#### 1. `AdminPostListPage` が一覧を構築している

```tsx
// src/components/AdminPostListPage.tsx
const cards: CardData[] = posts.map((post) => ({
  href: `/admin/${genre}/${post.id}`,  // リンク先は UUID ベース
  ...
}));
```

カードのリンクは `/admin/blog/550e8400-...` のような UUID の URL。

#### 2. `/admin/blog/[id]/page.tsx` が解決される

```tsx
// src/app/admin/blog/[id]/page.tsx
export default async function BlogEditPage({ params }) {
  const { id } = await params;   // "550e8400-..."
  return <PostEditPage id={id} genre="blog" />;
}
```

#### 3. `PostEditPage` が DB から記事データを取得する

```tsx
// src/components/PostEditPage.tsx
export default async function PostEditPage({ id, genre }) {
  const post = await getPostByIdForAdmin(id);   // UUID で1件取得
  if (!post) notFound();

  const tags = await getTagsByPostId(post.id);  // タグ一覧取得

  const initialData: ArticleInitialData = {
    id: post.id,              // UUID を渡す（これが edit の核心）
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    thumbnail: post.thumbnail ?? "",
    tags: tags.map((t) => t.name),
    publishStatus: post.status,    // "draft"
    savedAt: formatSavedAt(post.updatedAt),  // 例: "2026/03/22 | 14:30:00"
  };

  return <BlogEditor genre={genre} mode="edit" initialData={initialData} />;
}
```

`getPostByIdForAdmin` は UUID で `WHERE id = $1` を実行して1件取得。
`getTagsByPostId` は中間テーブルを JOIN してこの記事のタグ名を取得。

#### 4. `BlogEditor` が initialData で state を初期化する

```tsx
const [title, setTitle] = useState(initialData?.title ?? "");   // DB の値が入る
const [content, setContent] = useState(initialData?.content ?? "");
const [publishStatus, setPublishStatus] = useState(initialData?.publishStatus ?? "draft");
const [savedAt, setSavedAt] = useState(initialData?.savedAt ?? "");
// ...
```

画面には DB の値が入った状態でエディタが表示される。
AdminHeader には「最終保存日時」と「未公開」バッジが表示される。

---

### フェーズ5: 本文を修正して「下書き保存」をクリック

**操作**: Markdown エディタで本文を書き換え → 「下書き保存」

#### 1. Markdown エディタへの入力

```tsx
<SimpleMdeReact
  value={content}
  onChange={handleContentChange}   // → setContent(value)
/>
```

キー入力のたびに `content` state が更新される。右のプレビューもリアルタイムに更新。

#### 2. 「下書き保存」クリック → `handleSaveDraft`

```tsx
const handleSaveDraft = async () => {
  await saveAsDraftAction(payload());
  if (initialData?.id) {   // id = "550e8400-..." → true → edit ルート
    setSavedAt(formatSavedAt(new Date()));
    setPublishStatus("draft");
  }
};
```

#### 3. `saveAsDraftAction` がサーバーで実行される

```ts
export async function saveAsDraftAction(payload: SavePayload) {
  const { id, ... } = payload;

  if (!id) { ... }   // id がある → false
  else {
    await updatePostById(id, title, description, thumbnail || null, "blogs", "draft", content);
    await syncPostTags(id, tags);
    revalidatePath(`/admin/blog/${id}`);
  }
}
```

#### 4. `updatePostById` が DB を UPDATE する

```ts
// src/db/queries/update.ts
await db.update(postsTable)
  .set({
    title: newTitle,
    description: newDescription,
    thumbnail: newThumbnail,
    genre: newGenre,
    status: "draft",
    content: newContent,    // ← 修正した本文が保存される
    updatedAt: new Date(),  // ← 現在時刻に更新
    // publishedAt は undefined → SET 句に含まれない → DB の値はそのまま
  })
  .where(eq(postsTable.id, id));
```

#### 5. `syncPostTags` がタグを同期する

タグを変更していなければ、削除 → 同じタグを再挿入するだけで結果は変わらない。

#### 6. `revalidatePath` でキャッシュを破棄する

`/admin/blog/550e8400-...` のキャッシュを無効化。
次にこのページにアクセスしたとき、`PostEditPage` が DB から最新データを取得する。

#### 7. `await` 完了後にローカル state を更新する

```tsx
// handleSaveDraft の続き（クライアント側）
setSavedAt(formatSavedAt(new Date()));   // 「最終保存日時」を現在時刻に更新
setPublishStatus("draft");               // バッジを「未公開」のまま維持
```

ページ遷移なしに AdminHeader の「最終保存日時」が即時更新される。
エディタの内容はそのまま維持され、引き続き編集できる。

---

### フロー全体の図

```
[ユーザー]                [クライアント]               [サーバー]              [DB]
    |                         |                            |                    |
新規作成クリック               |                            |                    |
    |──────────────────────→ Link → /admin/blog/create     |                    |
    |                         |                            |                    |
    |                    BlogCreatePage                    |                    |
    |              BlogEditor(mode="create")               |                    |
    |                         |                            |                    |
フォーム入力                   |                            |                    |
    |──────→ onChange → setState（リアルタイムプレビュー）   |                    |
    |                         |                            |                    |
下書き保存クリック              |                            |                    |
    |──────────────────────→ handleSaveDraft()             |                    |
    |                         |──── saveAsDraftAction ────→|                    |
    |                         |                       createPost() ───────────→ INSERT
    |                         |                            |←───────── postId ──|
    |                         |                      syncPostTags() ───────────→ INSERT tags
    |                         |                       redirect("/admin/blog")   |
    |←──────────────────── ページ遷移 ────────────────────  |                    |
    |                         |                            |                    |
記事クリック                   |                            |                    |
    |──────────────────────→ Link → /admin/blog/{UUID}     |                    |
    |                         |                            |                    |
    |                    BlogEditPage                      |                    |
    |                    PostEditPage ──getPostByIdForAdmin()──────────────────→ SELECT
    |                         |                            |←── post data ──────|
    |                         |──── getTagsByPostId() ────→|                    |
    |                         |                            |←── tags ───────────|
    |              BlogEditor(mode="edit", initialData)    |                    |
    |                         |                            |                    |
本文修正                       |                            |                    |
    |──────→ onChange → setContent（右プレビューも更新）    |                    |
    |                         |                            |                    |
下書き保存クリック              |                            |                    |
    |──────────────────────→ handleSaveDraft()             |                    |
    |                         |──── saveAsDraftAction ────→|                    |
    |                         |                      updatePostById() ─────────→ UPDATE
    |                         |                      syncPostTags() ───────────→ DELETE + INSERT
    |                         |                      revalidatePath()           |
    |                         |←───────── 完了 ────────────|                    |
    |                    setSavedAt()                      |                    |
    |                    setPublishStatus()                |                    |
    |←── AdminHeader の保存日時が即時更新                  |                    |
```

---

### フェーズ6: 「公開」をクリック

**操作**: 編集ページの AdminHeader の「公開」ボタンをクリック（記事は現在 `draft` 状態）

#### 1. `handlePublish` が呼ばれる

```tsx
// src/components/BlogEditor.tsx
const handlePublish = async () => {
  await publishAction({
    ...payload(),
    wasAlreadyPublished: publishStatus === "published",  // "draft" なので false
  });
  if (initialData?.id) {   // id がある → true
    setSavedAt(formatSavedAt(new Date()));
    setPublishStatus("published");
  }
};
```

`publishStatus` は現在 `"draft"` なので `wasAlreadyPublished = false`。
これが初回公開であることをサーバーに伝えるフラグ。

#### 2. `publishAction` がサーバーで実行される

```ts
// src/app/admin/actions.ts
export async function publishAction(payload) {
  const { id, genre, title, description, content, thumbnail, tags, wasAlreadyPublished } = payload;

  // id がある → edit ルート
  await updatePostById(
    id, title, description, thumbnail || null, "blogs", "published", content,
    wasAlreadyPublished ? undefined : new Date(),  // false なので new Date() を渡す
  );
  await syncPostTags(id, tags);
  revalidatePath(`/admin/blog/${id}`);
}
```

#### 3. `updatePostById` が DB を UPDATE する

```ts
await db.update(postsTable)
  .set({
    status: "published",    // ← draft から published に変わる
    content: newContent,
    updatedAt: new Date(),
    publishedAt: new Date(),  // ← wasAlreadyPublished = false なので初めてセットされる
  })
  .where(eq(postsTable.id, id));
```

`publishedAt` が初めてセットされる点が「下書き保存」との違い。
これ以降、公開ページ（`/blog/[slug]`）で `publishedAt` を参照した「公開日」として表示される。

#### 4. `syncPostTags` がタグを同期する

タグを変更していなければ結果は変わらない（削除 → 再挿入）。

#### 5. `revalidatePath` でキャッシュを破棄する

サーバー側の編集ページのキャッシュを無効化。

#### 6. `await` 完了後にローカル state を更新する

```tsx
setSavedAt(formatSavedAt(new Date()));
setPublishStatus("published");   // バッジが「未公開」→「公開中」に変わる
```

AdminHeader のバッジが即時「公開中」（緑）に切り替わる。
エディタはそのまま維持される。

---

### フェーズ7: 公開済み記事を再び保存する（publishedAt が変わらないことの確認）

**操作**: 公開済み記事（`publishStatus = "published"`）で再度「公開」をクリック

```tsx
const handlePublish = async () => {
  await publishAction({
    ...payload(),
    wasAlreadyPublished: publishStatus === "published",  // 今度は true
  });
};
```

```ts
// actions.ts
await updatePostById(
  id, ..., "published", content,
  wasAlreadyPublished ? undefined : new Date(),  // true なので undefined を渡す
);
```

```ts
// update.ts
.set({
  status: "published",
  content: newContent,
  updatedAt: new Date(),
  // publishedAt は undefined → SET 句に含まれない → DB の値がそのまま保持される
})
```

`publishedAt` は最初に公開したときの日時のまま変わらない。
`updatedAt` だけが現在時刻に更新される。

---

### フェーズ8: 「アーカイブ」をクリック

**操作**: 編集ページの AdminHeader の「アーカイブ」ボタンをクリック（記事は現在 `published` 状態）

#### 1. `handleArchive` が呼ばれる

```tsx
// src/components/BlogEditor.tsx
const handleArchive = async () => {
  if (!initialData?.id) return;   // create モードでは呼ばれない（ボタン自体が非表示）
  await archiveAction({
    id: initialData.id,
    genre,
    slug,
    title,
    description,
    content,
    thumbnail,
  });
  setSavedAt(formatSavedAt(new Date()));
  setPublishStatus("archived");
};
```

タグは渡さない。アーカイブはステータスを変えるだけで、タグの変更は伴わないため。

#### 2. `archiveAction` がサーバーで実行される

```ts
// src/app/admin/actions.ts
export async function archiveAction(payload) {
  const { id, genre, title, description, content, thumbnail } = payload;
  await updatePostById(id, title, description, thumbnail || null, "blogs", "archived", content);
  revalidatePath(`/admin/blog/${id}`);
}
```

`syncPostTags` を呼ばない。タグの変更がないので同期不要。

#### 3. `updatePostById` が DB を UPDATE する

```ts
await db.update(postsTable)
  .set({
    status: "archived",     // ← published から archived に変わる
    content: newContent,
    updatedAt: new Date(),
    // publishedAt は undefined → 変わらない
  })
  .where(eq(postsTable.id, id));
```

ステータスが `"archived"` になることで、公開ページの `getPostsList` は
常に `status = "published"` で絞り込んでいるため、この記事は一覧に表示されなくなる。

#### 4. `revalidatePath` でキャッシュを破棄する

サーバー側の編集ページのキャッシュを無効化。

#### 5. `await` 完了後にローカル state を更新する

```tsx
setSavedAt(formatSavedAt(new Date()));
setPublishStatus("archived");   // バッジが「公開中」→「アーカイブ済」に変わる
```

AdminHeader のバッジが即時「アーカイブ済」（赤）に切り替わる。

---

### フェーズ6〜8 のフロー全体の図

```
[ユーザー]                [クライアント]               [サーバー]              [DB]
    |                         |                            |                    |
    |          （フェーズ5 までの状態: 下書き保存済み）      |                    |
    |                         |                            |                    |
公開クリック（初回）            |                            |                    |
    |──────────────────────→ handlePublish()               |                    |
    |                  wasAlreadyPublished = false          |                    |
    |                         |──── publishAction ────────→|                    |
    |                         |                      updatePostById()           |
    |                         |                      status="published"         |
    |                         |                      publishedAt=new Date() ───→ UPDATE
    |                         |                      syncPostTags() ───────────→ DELETE + INSERT
    |                         |                      revalidatePath()           |
    |                         |←───────── 完了 ────────────|                    |
    |                    setSavedAt()                      |                    |
    |                    setPublishStatus("published")     |                    |
    |←── バッジが「公開中」に変わる                        |                    |
    |                         |                            |                    |
公開クリック（再保存）          |                            |                    |
    |──────────────────────→ handlePublish()               |                    |
    |                  wasAlreadyPublished = true           |                    |
    |                         |──── publishAction ────────→|                    |
    |                         |                      updatePostById()           |
    |                         |                      publishedAt=undefined ────→ UPDATE（publishedAt 変わらず）
    |                         |←───────── 完了 ────────────|                    |
    |←── 保存日時のみ更新                                  |                    |
    |                         |                            |                    |
アーカイブクリック              |                            |                    |
    |──────────────────────→ handleArchive()               |                    |
    |                         |──── archiveAction ────────→|                    |
    |                         |                      updatePostById()           |
    |                         |                      status="archived" ────────→ UPDATE
    |                         |                      revalidatePath()           |
    |                         |←───────── 完了 ────────────|                    |
    |                    setSavedAt()                      |                    |
    |                    setPublishStatus("archived")      |                    |
    |←── バッジが「アーカイブ済」に変わる                  |                    |
    |                         |                            |                    |
    |              （公開ページの一覧からは非表示に）        |                    |
```
