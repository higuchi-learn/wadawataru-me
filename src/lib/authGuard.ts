import { auth } from '@/auth';

// Server Actions はミドルウェアの matcher（/admin/:path*, /api/upload）の対象外からでも
// アクションIDさえ分かれば直接呼び出せてしまう（ミドルウェアはページ表示のガードにしかならない）。
// そのため、DBを変更する Server Action は必ずこの関数でセッションの有無を確認してから処理を行う。
// R2 に書き込む /api/upload も、ミドルウェアだけに頼らず同じ関数で確認している。
// signIn コールバック（src/auth.ts）で許可アカウント以外はセッションを持てないため、
// セッションが存在すること自体が「許可されたオーナー本人」であることの確認になる。
// なお AUTH_SECRET 未設定などの設定エラー時は auth() が null ではなく { message: '...' } を返すため,
// !!session だと「ログイン済み」と誤判定してしまう。user の有無で判定する
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
