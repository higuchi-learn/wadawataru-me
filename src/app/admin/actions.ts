'use server';
// 'use server'により、このファイルの export された関数がServer Actions になる。
// Server Actions はクライアントから直接呼べるが
// サーバー上で実行されるため DB アクセスや秘密情報を安全に扱える

import { redirect } from 'next/navigation';
import { createPost } from '@/db/queries/insert';
import { updatePostById, syncPostTags } from '@/db/queries/update';
import { isSlugTaken } from '@/db/queries/select';
import { articleSchema } from '@/lib/schemas';
import type { Genre } from '@/components/GenreAbout';

type SavePayload = {
  id?: string;
  genre: Genre;
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  tags: string[];
};

type ActionResult = { error: string } | undefined;

// 記事を保存する機能（新規作成と更新の両方に対応）
export async function saveAsDraftAction(payload: SavePayload): Promise<ActionResult> {
  const { id, genre, slug, title, description, content, thumbnail, tags } = payload;

  // safeParse はバリデーション失敗時に例外を投げず { success: false, error } を返す
  // parse() を使うと失敗時に例外が投げられるため、エラーを呼び出し元に返したい場合は safeParse を使う
  const parsed = articleSchema.safeParse({ title, description, slug, content });
  if (!parsed.success) {
    // zod のエラーオブジェクトは issues 配列にエラーの詳細が入っているため、最初のエラーのメッセージを返す
    return { error: parsed.error.issues[0].message };
  }

  // slug の重複チェック。id を渡すことで自分自身の slug は除外してチェックできる（更新時の重複チェックに必要）
  if (await isSlugTaken(slug, id)) {
    return { error: 'このURLパスはすでに使われています' };
  }

  try {
    // id がない場合は新規作成、ある場合は更新する。
    // 新規作成のときは createdAt と updatedAt をセットする。更新のときは updatedAt を現在時刻にセットする。
    if (!id) {
      const postId = await createPost({
        genre,
        slug,
        title,
        description,
        content,
        thumbnail: thumbnail || null,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // 新規作成のときは記事IDがわからないため、createPost の戻り値である postId を使ってタグの紐付けを行う
      await syncPostTags(postId, tags);
    } else {
      // 更新のときは createdAt を変更しないため、updatePostById の引数には updatedAt を渡さない（updatePostById 内で自動的に現在時刻がセットされる）
      await updatePostById(id, title, description, thumbnail || null, genre, 'draft', content);
      // 更新のときは記事IDがわかっているので、それを使ってタグの紐付けを行う
      await syncPostTags(id, tags);
    }
  } catch {
    return { error: '保存に失敗しました。もう一度お試しください。' };
  }

  // redirect() は Next.js が内部的に特殊な例外(NEXT_REDIRECT)を throw することでページ遷移を実現している
  // try/catch の中で呼ぶと、その例外が catch ブロックに捕まってしまい
  // 「保存に失敗しました」エラーが返ってしまう。だから try の外に書く必要がある
  // （try を抜けた時点で DB 処理は成功しているため、ここに来たら必ずリダイレクトする）
  redirect(`/admin/${genre}`);
}

// 記事を公開する機能
export async function publishAction(payload: SavePayload & { wasAlreadyPublished: boolean }): Promise<ActionResult> {
  const { id, genre, slug, title, description, content, thumbnail, tags, wasAlreadyPublished } = payload;

  const parsed = articleSchema.safeParse({ title, description, slug, content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (await isSlugTaken(slug, id)) {
    return { error: 'このURLパスはすでに使われています' };
  }

  try {
    if (!id) {
      const postId = await createPost({
        genre,
        slug,
        title,
        description,
        content,
        thumbnail: thumbnail || null,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      });
      await syncPostTags(postId, tags);
    } else {
      await updatePostById(
        id,
        title,
        description,
        thumbnail || null,
        genre,
        'published',
        content,
        // 初回公開のときだけ publishedAt を現在時刻にセットする
        // 再公開（draft → published → draft → published）のときは publishedAt を上書きしない
        wasAlreadyPublished ? undefined : new Date(),
      );
      await syncPostTags(id, tags);
    }
  } catch {
    return { error: '公開に失敗しました。もう一度お試しください。' };
  }

  // try/catch の外に書く理由は saveAsDraftAction と同じ
  // redirect() が throw する例外を catch に捕まえさせないため
  redirect(`/${genre}/${slug}`);
}

// 記事をアーカイブする機能（公開状態を「archived」にするだけで、DB からは削除しない）
export async function archiveAction(payload: {
  id: string;
  genre: Genre;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
}): Promise<ActionResult> {
  const { id, genre, title, description, content, thumbnail } = payload;

  try {
    await updatePostById(id, title, description, thumbnail || null, genre, 'archived', content);
  } catch {
    return { error: 'アーカイブに失敗しました。もう一度お試しください。' };
  }

  // try/catch の外に書く理由は saveAsDraftAction と同じ
  redirect(`/admin/${genre}`);
}
