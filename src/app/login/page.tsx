import { signIn } from '@/auth';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  // searchParams は非同期オブジェクトのため await で展開する（Next.js 15 以降の仕様）
  const { error } = await searchParams;

  // Auth.js は不正アカウントでのログイン試行時に ?error=AccessDenied を付けてこのページに戻す
  // error が 'AccessDenied' のときだけエラーメッセージを表示する
  const isAccessDenied = error === 'AccessDenied';

  return (
    <div className="flex flex-col items-center justify-center gap-3 h-screen bg-white">
      {isAccessDenied && (
        <p className="text-sm text-[var(--error)]">このアカウントはアクセスできません。</p>
      )}
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
          await signIn('github', { redirectTo: '/admin/blogs' });
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
