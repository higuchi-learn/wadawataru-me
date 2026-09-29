import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// auth() に関数を渡すと「認証情報付きミドルウェア」になる
// Next.js のミドルウェアはリクエストがページ/APIに到達する前に実行されるため
// ここで未認証チェックをすることでサーバーコンポーネントや API の処理に入る前に弾ける
export default auth((req) => {
  // req.auth はセッションが存在すれば session オブジェクト、未認証なら null になる
  // ただし AUTH_SECRET 未設定などの設定エラー時は null ではなく { message: '...' } が入るため,
  // !req.auth だと「ログイン済み」と誤判定して素通りしてしまう。user の有無で判定する
  if (!req.auth?.user) {
    // new URL('/login', req.url) で現在のオリジンを保ちながら /login へのURLを生成する
    // 文字列 '/login' だけを渡すと相対パスになってしまうため URL オブジェクトを使う
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  // matcher に指定したパスにだけミドルウェアが実行される
  // '/admin/:path*' は /admin 以下の全パスにマッチする（:path* はワイルドカード）
  // 指定しない場合はすべてのリクエスト（静的ファイル含む）で実行されてしまい非効率になる
  matcher: ['/admin/:path*', '/api/upload'],
};
