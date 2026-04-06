# BlogEditor.tsx 解説

## このコンポーネントの役割

記事の新規作成・編集画面。タイトル・説明・タグ・サムネイル・本文を入力し、下書き保存・公開・アーカイブができる。

---

## 前提知識: Server Component と Client Component

Next.js のコンポーネントには2種類ある。

| | Server Component | Client Component |
|---|---|---|
| 宣言方法 | 何も書かない（デフォルト） | ファイル先頭に `'use client'` |
| 描画場所 | **サーバーのみ** | **サーバーでも、ブラウザでも** |
| できること | DB アクセス・秘密情報など | state・イベント処理など |

`'use client'` は「クライアント**のみ**」ではなく「クライアント**でも**動く」という意味。

実際の流れ：
```
1. ブラウザがページを開く
2. サーバーが BlogEditor を実行して HTML を生成して返す（→ 初期表示が速い）
3. ブラウザがその HTML をまず表示する
4. その後 JS が読み込まれ、state やイベントが有効になる（ハイドレーション）
```

`ssr: false` を付けた SimpleMdeReact だけが例外で、これだけはブラウザに届いてから描画される。

---

## 前提知識: React の state とは

React のコンポーネントは「state（状態）が変わると画面を再描画する」という仕組みで動いている。

```
state が変わる → React が差分を検出 → 画面を更新する
```

`useState` はその state を作る関数。

```ts
const [title, setTitle] = useState('');
// title  → 現在の値（読み取り専用）
// setTitle → 値を更新する関数（呼ぶと再描画が走る）
// useState('') → 初期値は空文字
```

`setTitle('Hello')` を呼ぶと `title` が `'Hello'` になり、その値を使っている部分の画面が更新される。  
直接 `title = 'Hello'` と代入しても React は変化を検知できないため画面は更新されない。

---

## state の一覧

BlogEditor では入力フィールドごとに state を持っている。

```ts
const [title, setTitle] = useState(initialData?.title ?? '');
const [description, setDescription] = useState(initialData?.description ?? '');
const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? '');
const [slug, setSlug] = useState(initialData?.slug ?? '');
const [content, setContent] = useState(initialData?.content ?? '');
const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
const [serverError, setServerError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

`initialData?.title ?? ''` は「編集モードなら既存の値、新規作成なら空文字」という意味。  
`?.` は「左が undefined なら undefined を返す（エラーにしない）」演算子。  
`??` は「左が null / undefined なら右を使う」演算子。

---

## 前提知識: コンポーネントの再描画とパフォーマンス

state が1つ変わると **BlogEditor 関数が最初から最後まで再実行される**。子コンポーネントも同様に再実行される。

たとえばタイトルを1文字入力したとき：

- `setTitle('H')` が呼ばれる
- BlogEditor 関数が再実行される
- InputField（タイトル欄）の表示が更新される
- Card（カードプレビュー）も再描画される
- 説明欄・URL欄など他の InputField も再実行される（表示は変わらないが）

このとき関数やオブジェクトも毎回新しく作られる。  
`SimpleMdeReact` は `onChange` に渡した関数が変わると「設定が変わった」と判断してエディタを再初期化してしまう。  
これを防ぐために `useCallback` と `useMemo` を使う。

---

## useCallback

関数を「記憶」して、毎回新しく作られないようにする。

```ts
const handleContentChange = useCallback((value: string) => {
  setContent(value);
}, []);
// [] は「依存配列」。空配列にすると初回だけ関数を生成し、以降は同じ関数を使い回す
```

`[]` の中には「この値が変わったら関数を作り直す」という値を入れる。  
空配列なので「一度も作り直さない」という意味になる。

### 逆に、関数を作り直す必要があるケース

関数の中で state を使っている場合、メモ化すると古い値を参照し続けてしまう（「古い値を閉じ込めた関数」になってしまう）。

SearchBar の `handleSearch` はメモ化していない。

```ts
// SearchBar.tsx（useCallback なし）
const handleSearch = () => {
  params.set('tags', selectedTags.join(','));  // selectedTags を使っている
};
```

もし `useCallback(handleSearch, [])` にしてしまうと：

```
初回: selectedTags = [] でこの関数が固定される
タグ選択: selectedTags = ['React'] になるが関数は古いまま
検索実行: selectedTags.join(',') = '' （空） → バグ
```

関数の中で使っている state が変わったら関数も作り直す必要があるため、この場合はメモ化しない（または依存配列に `[selectedTags]` を入れる）。

**メモ化はデフォルトではなく最適化手段**。「再生成するとまずい理由がある」ときだけ使う。

---

## useMemo

値を「記憶」して、毎回新しく作られないようにする。

```ts
const mdeOptions = useMemo(() => ({ spellChecker: false }), []);
```

`{}` はオブジェクトで、毎回書くと毎回「新しいオブジェクト」が生成される。  
`useMemo` で包むと初回だけ生成され、以降は同じオブジェクトを使い回す。

useCallback との違いは「関数を記憶するか、値を記憶するか」だけ。

---

## useRef vs useState

値を「記憶」するが、`useState` と違い**値が変わっても再描画しない**。

```ts
const mdeRef = useRef<EasyMDE | null>(null);
```

EasyMDE のインスタンス（エディタ本体のオブジェクト）を保存するために使っている。  
インスタンスを保存するだけで画面を更新する必要はないため `useRef` が適している。

`mdeRef.current` で値の読み書きができる。

### 逆に、useState を使うべきケース

`title` は `useRef` ではなく `useState` を使っている。

```ts
const [title, setTitle] = useState('');
```

`title` が変わったとき、input 欄の表示と Card プレビューの両方を更新する必要があるから。  
もし `useRef` にすると、文字を入力しても画面が更新されない。

| | 再描画が必要か | 使うもの |
|---|---|---|
| `title` など入力値 | 必要（画面に反映したい） | `useState` |
| `mdeRef` などインスタンス | 不要（保持するだけ） | `useRef` |

---

## dynamic import（SSR の無効化）

```ts
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });
```

Next.js はデフォルトで、コンポーネントをサーバー側でも描画しようとする（SSR）。  
しかし EasyMDE は `document` や `window` といったブラウザ専用の機能を使うため、サーバーで実行すると「document is not defined」エラーになる。

`ssr: false` を付けることで「このコンポーネントはブラウザに届いてから読み込む」と Next.js に伝えられる。

---

## エディタのイベント登録（handleGetMdeInstance）

`SimpleMdeReact` は初期化が完了すると `getMdeInstance` に EasyMDE のインスタンスを渡してくれる。  
そのタイミングで画像の貼り付け・ドロップのイベントを登録している。

```ts
const handleGetMdeInstance = useCallback((mde: EasyMDE) => {
  if (mdeRef.current) return;   // すでに登録済みなら何もしない
  mdeRef.current = mde;         // インスタンスを ref に保存

  const cm = mde.codemirror;    // EasyMDE の内部エディタ（CodeMirror）を取得

  cm.on('paste', (_, e: ClipboardEvent) => {
    const file = e.clipboardData?.files[0];
    if (!file?.type.startsWith('image/')) return;  // 画像以外はデフォルト動作に任せる
    e.preventDefault();   // ブラウザのデフォルト貼り付けをキャンセル
    insertImage(file);
  });
}, []);
```

`e.preventDefault()` を呼ばないと、画像のバイナリデータがそのままテキストとしてエディタに入力されてしまう。

画像アップロード後は `cm.replaceSelection('![](URL)')` でカーソル位置に Markdown の画像記法を挿入し、`setContent(cm.getValue())` で React の state と同期している。  
CodeMirror の内部状態は React の state と別管理なので、手動で同期する必要がある。

---

## バリデーション（validate 関数）

保存・公開ボタンを押したとき、サーバーに送る前にクライアント側でも入力チェックをしている。

```ts
const validate = (): FieldErrors | null => {
  const parsed = articleSchema.safeParse({ title, description, slug, content });
  if (!parsed.success) {
    // エラーをフィールドごとに集約する処理
    ...
    return errors;
  }
  return null;  // エラーなし
};
```

`safeParse` は Zod のバリデーション関数。失敗しても例外を投げず、結果をオブジェクトで返す。  
`parsed.error.issues` はエラーの配列で、1つのフィールドに複数エラーが同時に起きることもある。

必須エラーがある場合は「文字数超過」などを一緒に出すと混乱するため、必須エラーだけ表示するようにしている。

---

## 保存・公開ボタンの処理

```ts
const handleSaveDraft = async () => {
  const errors = validate();
  if (errors) {           // クライアントバリデーション失敗
    setFieldErrors(errors);
    return;               // サーバーには送らずここで終わる
  }
  setIsLoading(true);
  const result = await saveAsDraftAction(payload());  // Server Action を呼ぶ
  if (result?.error) {
    setIsLoading(false);  // エラーのときだけ false にする
  }
  // 成功時は Server Action 内の redirect() がページ遷移するので
  // このコンポーネント自体が消えるため setIsLoading(false) は不要
};
```

成功時に `setIsLoading(false)` を呼ばない理由は、`saveAsDraftAction` の中で `redirect()` が実行されページ遷移するため、このコンポーネント自体が画面から消えるから。

---

## サブコンポーネント

BlogEditor の中にはいくつかの小さなコンポーネントが定義されている。

### FormLabel
フィールドのラベルとエラーメッセージを表示する。エラーがあればエラー文言を、なければヒントを表示する。

### InputField
テキスト入力欄。`multiline` フラグで `<input>` か `<textarea>` かを切り替える。  
`value` と `onChange` を受け取って表示・更新する形式を「制御コンポーネント」と呼ぶ。React では入力値を state で管理するのが基本。

### TagsField
タグの追加・削除。タグ一覧（`tags`）は BlogEditor の state で管理されており、追加・削除のたびに `onChange` で BlogEditor に通知する。  
TagsField 自身が持つ state はテキストボックスの入力中の文字列（`input`）だけ。
