import { z } from 'zod';

// z.object() でバリデーションスキーマを定義する
// スキーマを Server Action とクライアント側バリデーションで共有することで
// 同じルールを二重実装せずに済む
export const articleSchema = z.object({
  // .min(1, ...) で空文字を弾く（min(0) だと空文字が通ってしまう）
  // .max(N, ...) の第2引数がバリデーション失敗時のエラーメッセージになる
  title: z.string().min(1, 'この要素は必須です。').max(27, '文字数が超過しています。最大文字数は27字です。'),
  description: z.string().min(1, 'この要素は必須です。').max(62, '文字数が超過しています。最大文字数は62字です。'),
  slug: z
    .string()
    .min(1, 'この要素は必須です。')
    .max(20, '文字数が超過しています。最大文字数は20字です。')
    // .regex() で許可する文字パターンを制限する
    // ^ と $ でスラッグ全体がこのパターンに一致することを保証する
    // [a-zA-Z0-9_-] のみ許可（日本語・スペース・記号などはここで弾く）
    .regex(/^[a-zA-Z0-9_-]+$/, '使用できない文字が含まれています。'),
  content: z.string().min(1, 'この要素は必須です。'),
});

// 日記は本文だけを持つシンプルな構造（タイトル・スラッグ・タグなどは不要）
export const diaryEntrySchema = z.object({
  content: z.string().min(1, 'この要素は必須です。'),
});

// 年表の出来事。最大文字数は history_events_table の varchar の長さと揃えている
export const historyEventSchema = z
  .object({
    era: z.enum(['elementary', 'junior_high', 'high_school', 'university', 'career'], 'この要素は必須です。'),
    // date 型のカラムに入れるため 'yyyy-mm-dd' 形式のみ許可する（<input type="date"> の値もこの形式）
    sortDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'この要素は必須です。'),
    dateLabel: z.string().min(1, 'この要素は必須です。').max(20, '文字数が超過しています。最大文字数は20字です。'),
    kind: z.enum(['life', 'tech'], 'この要素は必須です。'),
    // ラベルの id。空文字は「ラベルなし」を表す
    badgeId: z.union([z.literal(''), z.uuid('使用できない文字が含まれています。')]),
    title: z.string().min(1, 'この要素は必須です。').max(40, '文字数が超過しています。最大文字数は40字です。'),
    summary: z.string().max(120, '文字数が超過しています。最大文字数は120字です。'),
    content: z.string(),
    thumbnail: z.string(),
    // 制作物の記事の slug。空文字は「紐づけなし」。記事の slug と同じ形式・長さに制限する
    productSlug: z.union([
      z.literal(''),
      z
        .string()
        .max(20, '文字数が超過しています。最大文字数は20字です。')
        .regex(/^[a-zA-Z0-9_-]+$/, '使用できない文字が含まれています。'),
    ]),
    // 期間の種類。none = 期間なし、ended = 終了日あり、ongoing = 現在も継続中
    period: z.enum(['none', 'ended', 'ongoing']),
    // period が ended のときだけ使う終了日。それ以外のときは空文字
    endDate: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '使用できない文字が含まれています。')]),
  })
  .superRefine((data, ctx) => {
    if (data.period !== 'ended') return;
    if (data.endDate === '') {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'この要素は必須です。' });
    } else if (data.sortDate !== '' && data.endDate < data.sortDate) {
      // 'yyyy-mm-dd' 同士なら文字列比較で日付の前後を判定できる
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: '終了日は並び順の基準日以降にしてください。' });
    }
  });

export type HistoryEventInput = z.infer<typeof historyEventSchema>;

// 年表のラベル名。最大文字数は history_badges_table.name の varchar の長さと揃えている
export const historyBadgeNameSchema = z
  .string()
  .trim()
  .min(1, 'この要素は必須です。')
  .max(10, '文字数が超過しています。最大文字数は10字です。');
