'use server';

import { redirect } from 'next/navigation';
import { createPost } from '@/db/queries/insert';
import { updatePostById, syncPostTags } from '@/db/queries/update';
import type { Genre } from '@/components/GenreAbout';

const GENRE_DB_MAP: Record<Genre, 'blogs' | 'products' | 'books'> = {
  blog: 'blogs',
  products: 'products',
  books: 'books',
};

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

export async function saveAsDraftAction(payload: SavePayload): Promise<ActionResult> {
  const { id, genre, slug, title, description, content, thumbnail, tags } = payload;
  const dbGenre = GENRE_DB_MAP[genre];

  try {
    if (!id) {
      const postId = await createPost({
        genre: dbGenre,
        slug,
        title,
        description,
        content,
        thumbnail: thumbnail || null,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await syncPostTags(postId, tags);
    } else {
      await updatePostById(id, title, description, thumbnail || null, dbGenre, 'draft', content);
      await syncPostTags(id, tags);
    }
  } catch {
    return { error: '保存に失敗しました。もう一度お試しください。' };
  }

  redirect(`/admin/${genre}`);
}

export async function publishAction(payload: SavePayload & { wasAlreadyPublished: boolean }): Promise<ActionResult> {
  const { id, genre, slug, title, description, content, thumbnail, tags, wasAlreadyPublished } = payload;
  const dbGenre = GENRE_DB_MAP[genre];

  try {
    if (!id) {
      const postId = await createPost({
        genre: dbGenre,
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
        dbGenre,
        'published',
        content,
        wasAlreadyPublished ? undefined : new Date(),
      );
      await syncPostTags(id, tags);
    }
  } catch {
    return { error: '公開に失敗しました。もう一度お試しください。' };
  }

  redirect(`/${genre}/${slug}`);
}

export async function archiveAction(payload: {
  id: string;
  genre: Genre;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
}): Promise<ActionResult> {
  const { id, genre, title, description, content, thumbnail } = payload;
  const dbGenre = GENRE_DB_MAP[genre];

  try {
    await updatePostById(id, title, description, thumbnail || null, dbGenre, 'archived', content);
  } catch {
    return { error: 'アーカイブに失敗しました。もう一度お試しください。' };
  }

  redirect(`/admin/${genre}`);
}
