import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// NextAuth() を呼び出すと、以下の4つが返ってくる
//   handlers : GET / POST リクエストを処理する Next.js Route Handler（/api/auth/[...nextauth] で使う）
//   auth     : セッション情報を取得するユーティリティ（Server Component / Server Action / Middleware で使う）
//   signIn   : サインイン処理を呼び出す関数（Server Action 内で使う）
//   signOut  : サインアウト処理を呼び出す関数（Server Action 内で使う）
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],

  // Cloudflare Workers / Vercel 以外の環境では HOST が信頼されないため
  // trustHost: true を指定しないと CSRF トークン検証が失敗してログインできない
  trustHost: true,

  callbacks: {
    // signIn コールバックは OAuth 認証が完了した直後に呼ばれる
    // true を返すとログイン成功、false または文字列（リダイレクト先URL）を返すと拒否になる
    // profile は GitHub から返ってくるユーザー情報（login がGitHubのユーザー名）
    signIn({ profile }) {
      return profile?.login === process.env.AUTH_ALLOWED_GITHUB_LOGIN;
    },
  },

  pages: {
    // デフォルトの Auth.js サインインページ (/api/auth/signin) を使わず
    // 独自の /login ページにリダイレクトさせる
    signIn: '/login',
  },
});
