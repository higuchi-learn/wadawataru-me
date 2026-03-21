import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import TagsList from "@/components/TagsList";
import TableOfContents from "@/components/TableOfContents";
import { MOCK_ARTICLE } from "@/lib/mockArticle";
import { parseHeadings, generateHeadingId } from "@/lib/parseHeadings";

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function makeHeading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return function HeadingWithId({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const id = generateHeadingId(extractText(children));
    return (
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  };
}

const headingComponents = {
  h1: makeHeading("h1"),
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  h4: makeHeading("h4"),
  h5: makeHeading("h5"),
  h6: makeHeading("h6"),
};

export default function BlogArticlePage() {
  const headings = parseHeadings(MOCK_ARTICLE.content);

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="flex gap-8 w-full max-w-5xl">
        {/* 記事本体 */}
        <article className="flex-1 min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight text-black mb-2">
            {MOCK_ARTICLE.title}
          </h1>
          <p className="text-sm leading-6 text-[var(--lighttext)] mb-2">
            {MOCK_ARTICLE.description}
          </p>
          <TagsList tags={MOCK_ARTICLE.tags} className="mb-2" />
          <div className="flex gap-4 text-xs text-[var(--lighttext)] mb-8">
            <span>公開日：{MOCK_ARTICLE.publishedAt}</span>
            <span>最終更新日：{MOCK_ARTICLE.updatedAt}</span>
          </div>
          <div className="markdown-preview">
            <Markdown remarkPlugins={[remarkGfm]} components={headingComponents}>
              {MOCK_ARTICLE.content}
            </Markdown>
          </div>
        </article>

        {/* 目次サイドバー (lg以上のみ表示) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
