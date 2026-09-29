'use server';
// 日記専用の Server Action。posts 用の actions.ts とはデータ構造が異なる（タイトル・スラッグ・タグ・公開状態が存在しない）ため
// ファイルを分けている

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { upsertDiaryEntry } from '@/db/queries/insert';
import { diaryEntrySchema } from '@/lib/schemas';
import { isAuthenticated } from '@/lib/authGuard';
import { getTodayDateString } from '@/lib/formatDate';

// diary_entries_table.date は PostgreSQL の date 型なので 'yyyy-mm-dd' 形式のみ許可する
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type ActionResult = { error: string } | undefined;

// 日記を保存する（その日付の行がなければ新規作成、あれば上書き更新する）
export async function saveDiaryEntryAction(date: string, content: string): Promise<ActionResult> {
  // Server Action はミドルウェアの保護対象外のルートからも直接呼び出せてしまうため、ここで改めて認証を確認する
  if (!(await isAuthenticated())) {
    return { error: '認証が必要です。' };
  }

  if (!DATE_PATTERN.test(date)) {
    return { error: '不正な日付です。' };
  }

  // 過去の日付は書き足せるが、未来の日付の日記は書けないようにする
  // UI（DiaryDatePicker）でも制限しているが、Server Action は直接呼び出せるのでサーバー側でも必ず確認する
  // 'yyyy-mm-dd' は固定長のゼロ埋め文字列なので、文字列比較で日付の前後を判定できる
  if (date > getTodayDateString()) {
    return { error: '未来の日付の日記は書けません。' };
  }

  const parsed = diaryEntrySchema.safeParse({ content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await upsertDiaryEntry(date, content);
  } catch {
    return { error: '保存に失敗しました。もう一度お試しください。' };
  }

  // 一覧ページ（/admin/diary）は静的にプリレンダリングされるため、保存しただけではキャッシュが更新されない
  // revalidatePath でそのキャッシュを破棄し、次のアクセス時に最新の一覧を再生成させる
  revalidatePath('/admin/diary');

  // redirect() は例外を throw して遷移を実現するため、try/catch の外で呼ぶ必要がある
  // （中で呼ぶと catch に捕まって「保存に失敗しました」が誤って返ってしまう）
  redirect('/admin/diary');
}
