# 2026-10-03 セキュリティ・コード品質の一括修正

- 対応日: 2026-10-03
- 対象: 画像アップロード／配信 API、管理画面の Client Component、ESLint 設定、ドキュメント

コードを点検して見つかった 9 件の問題をまとめて直した。各項目について「概要と原因」「放置するとどうなるか」「どう対処したか」を記録する。

| # | 問題 | 種類 |
|---|---|---|
| 1 | アップロードの画像判定が自己申告のままだった | セキュリティ |
| 2 | SVG を同じドメインから無防備に配信していた（XSS） | セキュリティ |
| 3 | 画像配信にキャッシュ指定がなかった | パフォーマンス |
| 4 | async 関数をイベントハンドラーにそのまま渡していた | バグ（lint） |
| 5 | Prettier の整形エラーが約480件たまっていた | コード品質 |
| 6 | `<img>` 警告の扱いが決まっていなかった | lint 設定 |
| 7 | `pnpm lint` が Next.js 16 で動かなくなっていた | lint 設定 |
| 8 | `documents/todo.md` が4月から更新されていなかった | ドキュメント |
| 9 | `CLAUDE.md` の主要ファイル表が古かった | ドキュメント |

---

## 1. アップロードの画像判定が自己申告のままだった

### 概要と原因

[`/api/upload`](../src/app/api/upload/route.ts) は、画像かどうかを `file.type.startsWith('image/')` で確認し、拡張子を `file.name` から取っていた。

```ts
// 修正前
if (!file.type.startsWith('image/')) { ... }
const ext = file.name.split('.').pop() ?? 'bin';
await env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
```

`file.type` と `file.name` は、multipart/form-data の各パートに**送り手が書いた**ヘッダー（`Content-Type` と `filename`）の値でしかない。ブラウザは普通は正しい値を入れるが、`curl -F "file=@evil.html;type=image/png"` のようにすれば自由に偽装できる。つまり「サーバー側で検証している」というコメントとは裏腹に、実際には**中身を一度も見ていなかった**。

さらに、偽装された `Content-Type` がそのまま R2 に保存され、配信 API もその値を返していた。

### 放置するとどうなるか

- 画像以外のファイル（HTML や JS など）を R2 に置けてしまう。保存した Content-Type がそのまま配信されるので、`text/html` として登録されたファイルは `https://wadawataru.me/api/images/xxx` で**サイトのページとして表示される**。
- 自分のドメイン上に任意の HTML を置かれると、フィッシングページや XSS の足場に使われる。
- アップロードは `higuchi-learn` アカウントでログインしたときしかできないので、すぐに悪用される可能性は低い。ただ、GitHub のセッションが盗まれた・ブラウザ拡張に乗っ取られたといった「認証が破られた後」の被害を一段大きくしてしまう。

### どう対処したか

**ファイルの中身（先頭のバイト列）で形式を判定**するようにした。PNG や JPEG などのバイナリ形式は、ファイル先頭に形式ごとに決まった「マジックナンバー」がある。

| 形式 | 先頭のバイト列 |
|---|---|
| PNG | `89 50 4E 47 0D 0A 1A 0A` |
| JPEG | `FF D8 FF` |
| GIF | `47 49 46 38`（`GIF8`）|
| WebP | `52 49 46 46`（`RIFF`）＋ 8バイト目から `57 45 42 50`（`WEBP`）|
| SVG | テキスト形式なのでマジックナンバーはない。先頭 1KB に `<svg` タグがあるかで判定 |

- 判定は新しく作った [`src/lib/imageType.ts`](../src/lib/imageType.ts) の `detectImageType()` にまとめた。許可リストにない形式なら `null` を返し、API は 400 を返す。
- **拡張子と、R2 に保存する Content-Type も判定結果から決める**。`file.name` と `file.type` は一切使わない。
- `body.file as File` という型を合わせるだけのキャストをやめ、`instanceof File` で実際に File かどうかを確かめる（文字列が送られた場合に `file.size` が `undefined` のまま検査をすり抜けていた）。
- サイズ上限（5MB）のチェックは中身を読み込む**前**に行い、大きなファイルを無駄にメモリへ展開しないようにした。

動作確認: PNG・JPEG・GIF・WebP・SVG は正しく判定され、WAV（WebP と同じ `RIFF` で始まる）、HTML、空ファイルは `null` になることを確かめた。

> **補足**: `<svg` を含む HTML は SVG と判定されうる。ただし保存される Content-Type は `image/svg+xml` になり、2 の対策（CSP sandbox）でスクリプトは動かないので問題ない。

---

## 2. SVG を同じドメインから無防備に配信していた（XSS）

### 概要と原因

SVG は画像形式だが、中身は XML で、`<script>` を書ける。

```xml
<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>
```

`image/svg+xml` は `image/` で始まるのでアップロードのチェックを通る。そして [`/api/images/[key]`](../src/app/api/images/[key]/route.ts) は、それを **wadawataru.me と同じオリジン**から `image/svg+xml` として返していた。

SVG は埋め込み方によって挙動が違う。

| 読み込み方 | スクリプト |
|---|---|
| `<img src="...svg">` で埋め込む | 動かない（ブラウザが画像として扱う）|
| URL を直接開く／`<iframe>`・`<object>` で読み込む | **動く**（1つの文書として扱われる）|

また、保存されていた Content-Type が空のときに `image/png` と仮定して返す処理があり、ブラウザの「MIME スニッフィング」（宣言と中身が違うと中身から種類を推測する動作）を止める指定もなかった。

### 放置するとどうなるか

- 細工した SVG の URL（`https://wadawataru.me/api/images/xxx.svg`）を開かせるだけで、**wadawataru.me の権限で任意のスクリプトが動く**（保存型 XSS）。
- 管理者がログインした状態で開いてしまえば、Server Action を呼び出して記事を書き換える・削除するといった操作をされうる。
- 1 と同じく、アップロードできるのはログインしたときだけなので可能性は低い。ただ、「タグロゴとして外部から拾ってきた SVG に、たまたまスクリプトが入っていた」という事故は十分ありえる。

### どう対処したか

当初は「SVG のアップロードを拒否する」つもりだった。しかし [`padImageToSquare.ts`](../src/lib/padImageToSquare.ts) に SVG 専用の分岐があり、**タグロゴに SVG を使うのは想定された使い方**だと分かった。そこで拒否はせず、**配信するときに無害化する**方針に変えた。

配信 API のレスポンスに次のヘッダーを付ける。

```ts
'X-Content-Type-Options': 'nosniff',
'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
```

- `nosniff`: ブラウザに Content-Type からの推測をさせない。
- `default-src 'none'`: スクリプトや外部リソースの読み込みをすべて禁止する。
- `style-src 'unsafe-inline'`: SVG 内の `<style>` による見た目の指定だけは許可する（ロゴの表示が崩れないように）。
- `sandbox`: レスポンスを別オリジン扱いの隔離環境で開かせる。スクリプトの実行もフォーム送信もできない。

`<img>` で埋め込んだときはもともとスクリプトが動かないので、**サイト上の表示には影響しない**。

あわせて、保存されている Content-Type が `image/` で始まらない場合や未設定の場合は、`image/png` と仮定するのをやめて `application/octet-stream`（中身不明のバイナリ。ブラウザはページとして描画しない）を返すようにした。

> **配信側の判定をアップロード側より緩くした理由**: 配信側も 1 の許可リストで絞ると、判定を厳しくする前にアップロードされた AVIF などの画像が表示されなくなる。安全性はヘッダーで確保できるので、配信側は「`image/*` ならそのまま返す」にとどめた。

動作確認（`pnpm preview` ＋ ローカル R2）:

| 保存されていた Content-Type | 返された Content-Type | CSP / nosniff |
|---|---|---|
| `image/png` | `image/png` | 付与 |
| `image/svg+xml` | `image/svg+xml` | 付与 |
| `text/html` | `application/octet-stream` | 付与 |

---

## 3. 画像配信にキャッシュ指定がなかった

### 概要と原因

`/api/images/[key]` のレスポンスヘッダーは `Content-Type` だけで、`Cache-Control` がなかった。キャッシュしてよいかどうかの指示がないため、ブラウザも Cloudflare のエッジも積極的にはキャッシュしない。

### 放置するとどうなるか

- 画像を表示するたびに Worker が起動し、R2 から読み出す。記事一覧のように画像が多いページほど表示が遅くなる。
- Workers のリクエスト数と R2 の読み出し回数（Class B 操作）が、閲覧数に比例して増え続ける。無料枠を超えれば課金につながる。

### どう対処したか

画像のキーは `{タイムスタンプ}-{ランダム6文字}.{拡張子}` なので、**同じキーの中身が書き換わることはない**。こういう「URL ごとに中身が固定のファイル」は最長期間キャッシュしてよい。

```ts
'Cache-Control': 'public, max-age=31536000, immutable',
ETag: image.httpEtag,
```

- `public`: ブラウザだけでなく CDN などの共有キャッシュにも保存を許可する。
- `max-age=31536000`: 1年間有効。
- `immutable`: 期限内は再検証（サーバーへの「変わっていないか」の問い合わせ）も不要だと伝える。
- `ETag`: 期限切れ後の再検証で、変わっていなければ 304 で済ませるための識別子。

[OG 画像のキャッシュ対応](./og-image-caching-fix.md)で `/api/og` に付けたのと同じ考え方。2回目以降の表示では Worker も R2 も動かなくなる。

---

## 4. async 関数をイベントハンドラーにそのまま渡していた

### 概要と原因

ESLint の `@typescript-eslint/no-misused-promises` / `no-floating-promises` で、[`BlogEditor.tsx`](../src/components/BlogEditor.tsx)、[`TagManagementPage.tsx`](../src/components/TagManagementPage.tsx)、[`TagSelectOverlay.tsx`](../src/components/TagSelectOverlay.tsx) に計15件のエラーが出ていた。

```tsx
// 修正前
const handlePublish = async () => {
  setIsLoading(true);
  const result = await publishAction(...);   // ← ここで例外が出ると…
  ...
  setIsLoading(false);                       // ← ここまで来ない
};
<AdminHeader onPublish={handlePublish} />    // async 関数をそのまま渡している
```

React はイベントハンドラーの戻り値を使わない。async 関数を渡すと、関数が返す Promise は**誰にも受け取られずに放置される**。Server Action は、戻り値の `{ error }` とは別に、通信が切れたときなどに**例外を投げる**ことがある。その例外は放置された Promise の中で消えてしまう。

### 放置するとどうなるか

- 通信が不安定なときに「公開」を押すと、例外で処理が途中で止まり、`setIsLoading(false)` まで届かない。**ボタンが「処理中」のまま固まり**、ページを再読み込みするしかなくなる。
- 画面にエラーメッセージも出ないので、保存できたのかどうか分からない。書いた記事を失ったと思い込む、あるいは二重に保存する、といった事故につながる。
- タグの並べ替え（ドラッグ＆ドロップ）では、画面上は並び替わったのに保存に失敗しても何も表示されず、再読み込みで元に戻る。

### どう対処したか

**(1) ハンドラーの中で try/catch/finally を使う**

```ts
const handlePublish = async () => {
  setIsLoading(true);
  try {
    const result = await publishAction(...);
    if (result?.error) { ... }
  } catch (e) {
    unstable_rethrow(e);   // Next.js 内部の例外（redirect など）は投げ直す
    setServerError('通信に失敗しました。時間をおいて再度お試しください。');
  } finally {
    setIsLoading(false);   // 成功・エラー・例外のどの経路でも必ず実行される
  }
};
```

- `finally` に置くことで、ローディングの解除が必ず実行される。
- BlogEditor の Server Action は成功すると `redirect()` を呼ぶ。`redirect()` は内部で `NEXT_REDIRECT` という特殊な例外を投げて画面を遷移させる仕組みなので、catch で握りつぶすと**遷移しなくなる**。そこで Next.js 公式の `unstable_rethrow()` を使い、Next.js 内部の例外だけを投げ直すようにした。
- タグの並べ替えが失敗したときは「並び順の保存に失敗しました。再読み込みして確認してください。」と表示する。

**(2) 渡すときは `void` を付けて、待たないことを明示する**

```tsx
<AdminHeader onPublish={() => void handlePublish()} />
```

`void` は「この Promise は意図的に待たない（エラーは関数の中で処理済み）」という宣言になる。

**(3) ついでに直したこと**

- `onPaste={async (e) => { ... }}` のようにインラインで書いていた async 関数を、名前付きのハンドラー（`handleThumbnailPaste` / `handleImagePaste`）に切り出した。
- `TagManagementPage.tsx` にあった `uploadImage` 関数の複製を消し、[`src/lib/uploadImage.ts`](../src/lib/uploadImage.ts) の共通関数を使うようにした（lint が指摘した不要な `as { url: string }` はこの複製の中にあった）。
- `BlogEditor.tsx` の `messagesMap[field]!.push(...)` にある不要な `!`（型を変えない非 null アサーション）を消した。


**(4) 追加対応: lint が見逃していた残りのハンドラー**

`no-misused-promises` は「async 関数をそのまま渡しているか」しか見ていない。呼び出し側で `() => void handleX()` と書いてあれば警告は出ないが、**ハンドラーの中で例外を処理していなければ、ボタンが固まる問題は同じように起きる**。そこで、クライアント側で Server Action を await している箇所を `grep` で洗い出し、残りの3ファイルも同じ形にそろえた。

| ファイル | ハンドラー | 修正前の問題 |
|---|---|---|
| [`HistoryEventEditor.tsx`](../src/components/HistoryEventEditor.tsx) | `handleSave` / `handleDelete` | 例外が出ると `setIsLoading(false)` に届かず、保存・削除ボタンが無効のまま固まる |
| 同上 | `handleAddBadge` | 例外が出てもラベル作成欄にエラーが表示されない |
| [`DiaryEditor.tsx`](../src/components/DiaryEditor.tsx) | `handleSave` | 日記の保存ボタンが「処理中」のまま固まる |
| [`HistoryBadgeManager.tsx`](../src/components/HistoryBadgeManager.tsx) | `run`（ラベルの作成・名前変更・削除の共通処理） | `setIsLoading(false)` が `await` の直後にあり、例外が出るとそこに届かない |

いずれも try/catch/finally で囲み、catch の先頭で `unstable_rethrow(e)` を呼んでいる。年表と日記の保存・削除は成功時に `redirect()` するので、これがないと画面遷移が止まる。ラベル操作の Action は今は `redirect()` しないが、後から追加されても遷移を壊さないよう、同じ形にそろえた。

修正後、クライアント側で Server Action を await している箇所（15箇所と `HistoryBadgeManager` の `run`）はすべて try の中にある。

---

## 5. Prettier の整形エラーが約480件たまっていた

### 概要と原因

ESLint に Prettier のルール（`prettier/prettier`）が入っているのに、整形しないままコミットされたファイルがあった。特に最近作り直したページに多かった（トップページ 167件、career 138件、qualifications 43件、awards 36件、`/api/og` 26件 など）。中身はインデントの幅や改行位置のずれだけ。

### 放置するとどうなるか

- 動作には影響しない。
- ただ、後でそのファイルを編集して保存時に自動整形が走ると、**本当の変更と整形だけの変更が1つの差分に混ざる**。レビューで変更点を追いにくくなり、`git blame` も「整形しただけのコミット」で埋まってしまう。
- lint の出力が整形エラーで埋まるので、4 のような**本当に直すべきエラーが見えなくなる**（今回も480件の中に、整形以外のエラー17件が埋もれていた）。

### どう対処したか

```bash
pnpm exec eslint src --fix
```

で一括修正した（23ファイル）。自動修正は空白と改行しか変えないので、修正後に `tsc --noEmit`・`pnpm lint`・`next build` がすべて通ることを確認した。

今後は 7 で追加した `pnpm lint:fix` で同じことができる。

---

## 6. `<img>` 警告の扱いが決まっていなかった

### 概要と原因

Next.js の ESLint ルール `@next/next/no-img-element` は、`<img>` ではなく `next/image` の `<Image>` を使うよう警告する（`<Image>` は Next.js の画像最適化サーバーで画像を縮小・変換して配信するため）。

このサイト（OpenNext on Cloudflare）では、`<Image>` の変換は [`wrangler.jsonc`](../wrangler.jsonc) の `IMAGES` バインディングを通じて **Cloudflare Images** が担当する。バインディングは設定済みなので `<Image>` に置き換えれば最適化は動くが、**変換回数に応じて Cloudflare Images の料金が発生しうる**。一方で、このサイトの画像はアップロード済みの PNG やロゴの SVG が中心で、変換による効果は小さい。

ルールをどう扱うか方針が決まっていなかったため、ファイルによっては `eslint-disable-next-line` で個別に無効にし、それ以外の11箇所は警告が出たままになっていた。

> **訂正（同日）**: 最初は「Workers では Next.js の画像最適化が使えない」と書いていたが、誤りだった。OpenNext は `IMAGES` バインディングがあれば next/image の最適化をそのまま動かせる（[公式ドキュメント](https://opennext.js.org/cloudflare/howtos/image)）。`<img>` を使う判断は変えていないが、理由は「料金と効果の釣り合い」に改めた。

### 放置するとどうなるか

- 「直すべき警告」と「直さなくていい警告」が混ざり、lint の結果が当てにならなくなる。
- 誰か（未来の自分を含む）が警告を消そうとして `<Image>` に置き換えると、意図せず Cloudflare Images の料金が発生しうる。`width`/`height` の指定が必須になるなど、書き換えの手間も増える。

### どう対処したか

[`eslint.config.mjs`](../eslint.config.mjs) で `@next/next/no-img-element` をプロジェクト全体で `off` にし、「意図的に `<img>` を使っている（料金と効果の釣り合い）」という理由をコメントに残した。個別に書いていた `eslint-disable-next-line`（トップページと `ImageSlot.tsx` の2箇所）は不要になったので消した。

検討した他の案:

| 案 | 採用しなかった理由 |
|---|---|
| `<Image>` に置き換えて Cloudflare Images で最適化する | 変換の料金が発生しうる。画像が PNG・SVG 中心で効果が小さく、個人サイトの規模では見合わない。表示速度が問題になったら見直す |
| `<Image unoptimized>` に置き換える | 実質 `<img>` と同じなのに、書き換えの手間とサイズ指定の制約だけが増える |

---

## 7. `pnpm lint` が Next.js 16 で動かなくなっていた

### 概要と原因

`package.json` の lint スクリプトが `"lint": "next lint"` のままだった。`next lint` は Next.js 15.5 で非推奨になり、**16 で削除された**。このプロジェクトは `next@16.1.5`。

### 放置するとどうなるか

- `pnpm lint` を実行してもエラーになり、lint を走らせる手段がない状態になる。
- 実際、5 のように整形エラーが480件たまるまで誰も気づかなかったのは、手軽に lint を回せなかったことも一因と考えられる。

### どう対処したか

```json
"lint": "eslint src",
"lint:fix": "eslint src --fix",
```

- ESLint を直接呼ぶ形に変えた。
- 最初は `eslint .` にしたが、OpenNext が生成するビルド成果物（`.open-next/`）まで対象になり、型情報が必要なルールで落ちた。そこで、もとの `next lint` と同じく `src` 配下だけを対象にし、念のため [`eslint.config.mjs`](../eslint.config.mjs) の `ignores` にも `.open-next/**` と `.wrangler/**` を追加した。
- 修正後の `pnpm lint` はエラー 0・警告 0。

---

## 8. `documents/todo.md` が4月から更新されていなかった

### 概要と原因

[`todo.md`](./todo.md) は 2026-04 から更新されておらず、載っている項目（説明欄の折り返し、isLoading のリセット、ログインエラーの表示、slug 重複の検証、R2 アップロード、タグ管理、未着手ページなど）は**ほとんどが実装済み**だった。

### 放置するとどうなるか

- 「まだやっていないこと」を判断する材料として使えない。済んだ作業をもう一度調べる無駄が出る。
- 逆に、「サーバー側の MIME 検証は済んでいる」と思い込み、1 のように**実は不十分なまま**だった問題を見落とす原因にもなる。

### どう対処したか

「未対応」と「完了済み」に分けて書き直した。完了済みの各項目には対応内容を書き、今回直したもの（1・4）には、このドキュメントの該当箇所へのリンクを付けた。

---

## 9. `CLAUDE.md` の主要ファイル表が古かった

### 概要と原因

[`CLAUDE.md`](../CLAUDE.md) の主要ファイル表に、後から追加された OG 画像生成（`/api/og`）・タグ管理・日記まわりのファイルが載っていなかった。また `actions.ts` の説明に「画像アップロード」とあったが、実際には画像アップロードは `/api/upload` が担当していて、`actions.ts` にはない。

### 放置するとどうなるか

- `CLAUDE.md` は Claude Code が毎回最初に読む「プロジェクトの地図」。古いままだと、関連ファイルの見落としや、間違ったファイルを修正してしまう原因になる。
- 今回のように「新しいルール（async ハンドラーの書き方など）」が書かれていないと、同じ問題がまた入り込む。

### どう対処したか

- 主要ファイル表に `imageType.ts`・`uploadImage.ts`・`/api/og`・`generatePostMetadata.ts`・`tag-actions.ts`・`TagManagementPage.tsx`・`TagSelectOverlay.tsx`・`diary-actions.ts`・日記コンポーネントを追加し、`actions.ts` の説明を直した。
- 開発コマンドに `pnpm lint` / `pnpm lint:fix` を追加した。
- 「主要な制約・注意点」に次の3つを追加した。
  - 画像の拡張子と Content-Type は中身の判定結果から決めること
  - async ハンドラーは `() => void handleX()` で渡し、中で try/catch/finally を使うこと（Server Action を catch するときは `unstable_rethrow`）
  - `<img>` を使ってよいこと（ルールを無効にしてある理由つき）

---

## 確認したこと

| 確認 | 結果 |
|---|---|
| `pnpm exec tsc --noEmit` | エラーなし |
| `pnpm lint` | エラー 0・警告 0（修正前は 506件）|
| `next build` | 成功 |
| `detectImageType()` に各形式のバイト列を渡す | 期待どおり判定（WAV・HTML・空ファイルは拒否）|
| `pnpm preview` で `/api/images/*` のヘッダーを確認 | 2 の表のとおり |
| 未ログインで `/api/upload` に POST する | `/login` へ 307 リダイレクト（ミドルウェアは変更なし）|

**未確認**: ログインした状態での実際のアップロード（GitHub OAuth が必要なため）。デプロイ後に、管理画面でサムネイル・本文・タグ画像（PNG と SVG）を1枚ずつ貼り付けて確かめること。
