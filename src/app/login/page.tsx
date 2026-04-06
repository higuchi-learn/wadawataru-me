import { signIn } from '@/auth';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      {/*
        form の action に async 関数を渡すと Server Action になる
        ボタンを押したとき（form の submit）にサーバー側で signIn() が実行される
        クライアント側 JS なしで動作するため、JS が無効な環境でも動く
      */}
      <form
        action={async () => {
          'use server';
          // signIn('github', ...) で GitHub OAuth フローを開始する
          // Auth.js が /api/auth/signin/github にリダイレクトし、GitHub の認可画面へ飛ぶ
          // 認証完了後は redirectTo で指定したパスに戻ってくる
          await signIn('github', { redirectTo: '/admin/blog' });
        }}
      >
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white text-sm rounded-sm hover:bg-gray-800 transition-colors"
        >
          GitHubでサインイン
        </button>
      </form>
    </div>
  );
}
