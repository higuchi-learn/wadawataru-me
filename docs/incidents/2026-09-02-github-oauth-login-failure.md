# GitHub OAuthログイン失敗（error=Configuration）

- 発生日: 2026-09-02
- 環境: 本番（`https://wadawataru.me`）
- 症状: `/login` からGitHub認証を行うと、GitHub側の認可は通るが、コールバック後に `https://wadawataru.me/login?error=Configuration` にリダイレクトされログインできない

## 原因

GitHubのOAuth認可レスポンスに `iss`（issuer）パラメータが付与されるようになった。

```
GET /api/auth/callback/github?code=...&iss=https%3A%2F%2Fgithub.com%2Flogin%2Foauth
```

`src/auth.ts` の GitHub プロバイダ設定で `issuer` を明示していなかったため、next-auth（Auth.js v5 beta）が「検証対象のissuerが未設定」と判断し、受け取った `iss` を検証できずに fail closed（認証を拒否）していた。

`wrangler tail` で確認したエラー:

```
[auth][error] CallbackRouteError
[auth][cause]: unexpected "iss" (issuer) response parameter value
[auth][details]: { "expected": "https://authjs.dev", "provider": "github" }
```

`expected: "https://authjs.dev"` はissuer未設定時に使われるプレースホルダーで、実際にGitHubから返る `iss` （`https://github.com/login/oauth`）と一致せずエラーになっていた。

同種の事象はnext-auth本体でも報告されている: https://github.com/nextauthjs/next-auth/issues/13409

なお、直前（3日前）にデプロイしていた以下のコミットは今回の事象とは無関係だった（`src/auth.ts` / `src/middleware.ts` を変更していない）。
- `579f0b0` Server Action にセッション認証チェックを追加
- `b0d6ddf` タグ画像が公開ページに表示されない不具合を修正
- `dcd27e0` タグ画像を正方形に自動パディングする機能

## 対応

`src/auth.ts` のGitHubプロバイダに `issuer` を明示することで、受け取った `iss` を正しく検証できるようにした。

```ts
providers: [GitHub({ issuer: 'https://github.com/login/oauth' })],
```

対応コミット: `399f73f`

## 調査時に使ったコマンド

```bash
# 本番のシークレット一覧（値は表示されない）を確認
npx wrangler secret list

# 本番のリアルタイムログを見ながらログインを試す
npx wrangler tail --format pretty
```

## 教訓

- OAuthプロバイダ側の仕様変更で、コードを変更していなくても突然ログインが壊れることがある
- `error=Configuration` のような抽象的なエラーページの裏にある実際の例外は `wrangler tail` で確認するのが早い
- 外部プロバイダ（GitHub等）を使うOAuth設定では、可能な限り `issuer` を明示しておくと同種の事故を予防できる
