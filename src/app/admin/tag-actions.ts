'use server';

import { revalidatePath } from 'next/cache';
import { createTag, addTagToGenre, findTagByName } from '@/db/queries/insert';
import { deleteTagById, removeTagFromGenre } from '@/db/queries/delete';
import { updateTagById, updateGenreTagsSortOrder } from '@/db/queries/update';
import { getMaxGenreTagSortOrder } from '@/db/queries/select';

// GenreTab はフロントとサーバーの両方で使うため、ここで一元定義して export する
// DB の articlesGenreEnum と同じ値にしておくことで型の整合性を保つ
export type GenreTab = 'products' | 'blogs' | 'books';

// TagItem はタグ一覧 UI で使うデータ形状
// DB の SELECT 結果から必要なカラムだけを取り出したもの
export type TagItem = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type TagActionResult = { error: string } | TagItem;

// 他ジャンルにすでに存在するタグを指定ジャンルへ追加する
// タグ本体（名前・画像）は変更せず genre_tag_orders に1行追加するだけ
export async function addExistingTagToGenreAction(tag: TagItem, genre: GenreTab): Promise<TagActionResult> {
  try {
    const maxOrder = await getMaxGenreTagSortOrder(genre);
    try {
      // addTagToGenre は (genre, tag_id) が複合 PK なので
      // 同じ組み合わせを再度 INSERT しようとすると DB エラーになる
      // 内側の try-catch でそのエラーを捕まえて「重複」メッセージに変換する
      await addTagToGenre(tag.id, genre, maxOrder + 1);
    } catch {
      return { error: 'このタグはすでにこのジャンルに追加されています。' };
    }
    // Server Action が DB を変更したのでページのキャッシュを破棄する
    // これにより次回 /admin/tags を開いたとき最新データが取得される
    revalidatePath('/admin/tags');
    // 呼び出し元が UI を即時更新できるよう、追加したタグのデータをそのまま返す
    return tag;
  } catch {
    return { error: '追加に失敗しました。もう一度お試しください。' };
  }
}

// タグをジャンルに追加する Server Action
// 同名タグが tags_table にすでに存在する場合は新規作成せずそのタグを再利用する
// （同名のタグが複数作られてIDが分かれるのを防ぐため）
export async function createTagAction(name: string, imageUrl: string | null, genre: GenreTab): Promise<TagActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'タグ名は必須です。' };
  if (trimmed.length > 20) return { error: '最大20字です。' };

  try {
    // 末尾に追加するために現在の最大 sortOrder を先に取得する
    const maxOrder = await getMaxGenreTagSortOrder(genre);

    // 同名タグが tags_table にあるか確認する
    const existing = await findTagByName(trimmed);

    let id: string;
    let resolvedImageUrl: string | null;

    if (existing) {
      // 既存タグが見つかった場合：タグは作らずジャンルへの紐付けだけを行う
      // 既存タグの imageUrl を引き継ぐ（入力された imageUrl は無視する）
      try {
        await addTagToGenre(existing.id, genre, maxOrder + 1);
      } catch {
        // (genre, tag_id) の複合 PK 違反 = すでに登録済み
        return { error: 'このタグはすでにこのジャンルに追加されています。' };
      }
      id = existing.id;
      resolvedImageUrl = existing.imageUrl;
    } else {
      // 新規タグの場合：tags_table に作成してから genre_tag_orders に紐付ける
      id = await createTag({ name: trimmed, imageUrl });
      await addTagToGenre(id, genre, maxOrder + 1);
      resolvedImageUrl = imageUrl;
    }

    revalidatePath('/admin/tags');
    return { id, name: trimmed, imageUrl: resolvedImageUrl };
  } catch {
    return { error: '追加に失敗しました。もう一度お試しください。' };
  }
}

// タグの名前・画像を更新する
// tags_table を更新するため全ジャンルで共通のタグ情報が変わる（ジャンル固有の情報ではない）
export async function updateTagAction(id: string, name: string, imageUrl: string | null): Promise<TagActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'タグ名は必須です。' };
  if (trimmed.length > 20) return { error: '最大20字です。' };

  try {
    await updateTagById(id, trimmed, imageUrl);
    revalidatePath('/admin/tags');
    return { id, name: trimmed, imageUrl };
  } catch {
    return { error: '更新に失敗しました。もう一度お試しください。' };
  }
}

// タグを指定ジャンルからのみ除外する
// tags_table 本体は残るため、他ジャンルでの使用や記事との紐付けに影響しない
export async function removeTagFromGenreAction(id: string, genre: GenreTab): Promise<{ error: string } | undefined> {
  try {
    await removeTagFromGenre(id, genre);
    revalidatePath('/admin/tags');
  } catch {
    return { error: 'ジャンルからの除外に失敗しました。もう一度お試しください。' };
  }
}

// タグを完全に削除する
// post_tags_table（記事との紐付け）→ genre_tag_orders（ジャンルとの紐付け）→ tags_table の順に削除する
// FK 制約があるため参照元テーブルを先に削除しないと DB エラーになる（deleteTagById 内で処理）
export async function deleteTagAction(id: string): Promise<{ error: string } | undefined> {
  try {
    await deleteTagById(id);
    revalidatePath('/admin/tags');
  } catch {
    return { error: '削除に失敗しました。もう一度お試しください。' };
  }
}

// 指定ジャンルのタグ並び順を保存する
// ドラッグ完了後に自動で呼ばれる。tagIds の配列順がそのまま sortOrder になる
export async function updateTagsSortOrderAction(genre: GenreTab, tagIds: string[]): Promise<{ error: string } | undefined> {
  try {
    await updateGenreTagsSortOrder(genre, tagIds);
    revalidatePath('/admin/tags');
  } catch {
    return { error: '並び替えの保存に失敗しました。もう一度お試しください。' };
  }
}
