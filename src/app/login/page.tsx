import { signIn } from '@/auth';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <form
        action={async () => {
          'use server';
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
