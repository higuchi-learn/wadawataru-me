'use server';
// 年表専用の Server Action。posts とはデータ構造が異なる（スラッグ・タグ・公開状態が存在しない）ため
// ファイルを分けている

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createHistoryEvent, createHistoryBadge } from '@/db/queries/insert';
import { updateHistoryEventById, renameHistoryBadge } from '@/db/queries/update';
import { deleteHistoryEventById, deleteHistoryBadgeById } from '@/db/queries/delete';
import { getHistoryBadgesList } from '@/db/queries/select';
import { historyEventSchema, historyBadgeNameSchema, type HistoryEventInput } from '@/lib/schemas';
import { isAuthenticated } from '@/lib/authGuard';

type ActionResult = { error: string } | undefined;

// 年表の出来事を保存する（id がなければ新規作成、あれば更新）
export async function saveHistoryEventAction(id: string | undefined, input: HistoryEventInput): Promise<ActionResult> {
  // Server Action はミドルウェアの保護対象外のルートからも直接呼び出せてしまうため、ここで改めて認証を確認する
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  const parsed = historyEventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { badgeId, summary, thumbnail, productSlug, period, endDate, ...rest } = parsed.data;
  // 任意項目は空文字ではなく null で保存し、「未設定」を DB 上で区別できるようにする
  const data = {
    ...rest,
    badgeId: badgeId || null,
    summary: summary.trim() || null,
    thumbnail: thumbnail.trim() || null,
    productSlug: productSlug || null,
    // フォームの「期間」の選択を DB の end_date / ongoing の組み合わせに変換する
    endDate: period === 'ended' ? endDate : null,
    ongoing: period === 'ongoing',
  };

  try {
    if (id) {
      await updateHistoryEventById(id, data);
    } else {
      await createHistoryEvent(data);
    }
  } catch {
    return { error: '保存に失敗しました。もう一度お試しください。' };
  }

  // redirect() は例外を throw して遷移を実現するため、try/catch の外で呼ぶ必要がある
  redirect('/admin/history');
}

// 年表の出来事を削除する
export async function deleteHistoryEventAction(id: string): Promise<ActionResult> {
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  try {
    await deleteHistoryEventById(id);
  } catch {
    return { error: '削除に失敗しました。もう一度お試しください。' };
  }

  redirect('/admin/history');
}

// 同じ名前のラベルがすでにあるか（excludeId には名前変更中のラベル自身を渡して除外する）
// name には UNIQUE 制約があるので DB でも弾かれるが、分かりやすいエラーメッセージを返すために先に確認する
async function isBadgeNameTaken(name: string, excludeId?: string): Promise<boolean> {
  const badges = await getHistoryBadgesList();
  return badges.some((b) => b.name === name && b.id !== excludeId);
}

// 年表のラベルを新規作成し、作成したラベルを返す（エディタでそのまま選択状態にするため）
export async function createHistoryBadgeAction(
  name: string,
): Promise<{ error: string } | { badge: { id: string; name: string } }> {
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  const parsed = historyBadgeNameSchema.safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  if (await isBadgeNameTaken(parsed.data)) {
    return { error: 'そのラベルはすでにあります。' };
  }

  try {
    const id = await createHistoryBadge(parsed.data);
    revalidatePath('/admin/history');
    return { badge: { id, name: parsed.data } };
  } catch {
    return { error: 'ラベルの追加に失敗しました。もう一度お試しください。' };
  }
}

// 年表のラベル名を変更する
export async function renameHistoryBadgeAction(id: string, name: string): Promise<ActionResult> {
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  const parsed = historyBadgeNameSchema.safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  if (await isBadgeNameTaken(parsed.data, id)) {
    return { error: 'そのラベルはすでにあります。' };
  }

  try {
    await renameHistoryBadge(id, parsed.data);
  } catch {
    return { error: 'ラベル名の変更に失敗しました。もう一度お試しください。' };
  }
  revalidatePath('/admin/history');
}

// 年表のラベルを削除する。付いていた出来事は「ラベルなし」になる
export async function deleteHistoryBadgeAction(id: string): Promise<ActionResult> {
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  try {
    await deleteHistoryBadgeById(id);
  } catch {
    return { error: 'ラベルの削除に失敗しました。もう一度お試しください。' };
  }
  revalidatePath('/admin/history');
}
