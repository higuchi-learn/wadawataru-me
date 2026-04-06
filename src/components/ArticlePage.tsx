import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import TagsList from '@/components/TagsList';
import TableOfContents from '@/components/TableOfContents';
import { parseHeadings, generateHeadingId } from '@/lib/parseHeadings';

export type ArticlePageData = {
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  content: string;
};

// 目次リンク（<a href="#見出しid">）を機能させるために、見出しタグに id が必要
// その id を生成するには見出しのテキストが必要だが、
// react-markdown はテキストをそのまま渡してくれるわけではなく
// JSX（画面描画用のオブジェクト）として渡してくる
//
// 例: ## Hello **World** という Markdown は以下の JSX になる
//   children = ["Hello ", <strong>World</strong>]
//   ↑文字列と <strong> タグが混在した配列になっている
//
// この関数は JSX の中から文字列だけを集めて "Hello World" を取り出す
function extractText(node: React.ReactNode): string {
  // 文字列ならそのまま返す（例: "Hello " → "Hello "）
  if (typeof node === 'string') return node;
  // 配列なら各要素を処理して結合する（例: ["Hello ", <strong>...</strong>] → "Hello World"）
  if (Array.isArray(node)) return node.map(extractText).join('');
  // JSX 要素（<strong> など）なら中身（children）を取り出して同じ処理をする
  // 例: <strong>World</strong> の中身は "World" という文字列なので "World" が返る
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

// 見出しタグ（h1〜h6）に id を付与するカスタムコンポーネントを生成するファクトリ関数
// 目次の <a href="#id"> リンクが機能するために見出し要素に id が必要
function makeHeading(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return function HeadingWithId({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    // 見出しテキストから ID を生成する（スペースをハイフンに変換するなど）
    const id = generateHeadingId(extractText(children));
    return (
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  };
}

// react-markdown の components prop に渡すことで、Markdown の h1〜h6 を
// id 付きのカスタムコンポーネントに置き換える
const headingComponents = {
  h1: makeHeading('h1'),
  h2: makeHeading('h2'),
  h3: makeHeading('h3'),
  h4: makeHeading('h4'),
  h5: makeHeading('h5'),
  h6: makeHeading('h6'),
};

export default function ArticlePage({ title, description, tags, publishedAt, updatedAt, content }: ArticlePageData) {
  // Markdown 文字列から見出し一覧を取得して目次に渡す
  const headings = parseHeadings(content);

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="flex gap-8 w-full max-w-5xl">
        <article className="flex-1 min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight text-black mb-2">{title}</h1>
          <p className="text-sm leading-6 text-[var(--lighttext)] mb-2">{description}</p>
          <TagsList tags={tags} className="mb-2" />
          <div className="flex gap-4 text-xs text-[var(--lighttext)] mb-8">
            <span>公開日：{publishedAt}</span>
            <span>最終更新日：{updatedAt}</span>
          </div>
          <div className="markdown-preview">
            {/*
              <Markdown> はデフォルトで基本的な Markdown（# 見出し、**太字** など）しか解釈しない
              remarkPlugins={[remarkGfm]} を渡すことで、テーブルや- [ ] チェックボックスなど
              GitHub で使える書き方も追加で解釈できるようになる

              components={headingComponents} は「h1〜h6 タグを描画するとき、
              デフォルトの <h1> ではなく自作の HeadingWithId コンポーネントを使う」という指定
              HeadingWithId は id を自動で付けるので、目次の <a href="#id"> クリックで
              該当の見出しまでスクロールできるようになる
            */}
            <Markdown remarkPlugins={[remarkGfm]} components={headingComponents}>
              {content}
            </Markdown>
          </div>
        </article>

        <aside className="hidden lg:block w-56 shrink-0">
          {/*
            sticky top-8 で目次をスクロールに追従させる
            親要素（aside）が画面内にある間は固定位置に留まり、
            記事末尾を超えたら普通にスクロールアウトする
          */}
          <div className="sticky top-8">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
