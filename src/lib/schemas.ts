import { z } from 'zod';

export const articleSchema = z.object({
  title: z
    .string()
    .min(1, 'この要素は必須です。')
    .max(27, '文字数が超過しています。最大文字数は27字です。'),
  description: z
    .string()
    .min(1, 'この要素は必須です。')
    .max(62, '文字数が超過しています。最大文字数は62字です。'),
  slug: z
    .string()
    .min(1, 'この要素は必須です。')
    .max(20, '文字数が超過しています。最大文字数は20字です。')
    .regex(/^[a-zA-Z0-9_-]+$/, '使用できない文字が含まれています。'),
  content: z.string().min(1, 'この要素は必須です。'),
});
