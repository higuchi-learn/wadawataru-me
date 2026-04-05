import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  trustHost: true,
  callbacks: {
    signIn({ profile }) {
      return profile?.login === process.env.AUTH_ALLOWED_GITHUB_LOGIN;
    },
  },
  pages: {
    signIn: '/login',
  },
});
