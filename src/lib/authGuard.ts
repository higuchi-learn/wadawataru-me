import { auth } from '@/auth';

// Server Actions はミドルウェアの matcher（/admin/:path*, /api/upload）の対象外からでも
// アクションIDさえ分かれば直接呼び出せてしまう（ミドルウェアはページ表示のガードにしかならない）。
// そのため、DBを変更する Server Action は必ずこの関数でセッションの有無を確認してから処理を行う。
// signIn コールバック（src/auth.ts）で許可アカウント以外はセッションを持てないため、
// セッションが存在すること自体が「許可されたオーナー本人」であることの確認になる。
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}
