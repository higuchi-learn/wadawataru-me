import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import TagsList from "@/components/TagsList";
import TableOfContents from "@/components/TableOfContents";
import { parseHeadings, generateHeadingId } from "@/lib/parseHeadings";

export type ArticlePageData = {
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  content: string;
};

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

export default function ArticlePage({ title, description, tags, publishedAt, updatedAt, content }: ArticlePageData) {
  const headings = parseHeadings(content);

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="flex gap-8 w-full max-w-5xl">
        <article className="flex-1 min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight text-black mb-2">
            {title}
          </h1>
          <p className="text-sm leading-6 text-[var(--lighttext)] mb-2">
            {description}
          </p>
          <TagsList tags={tags} className="mb-2" />
          <div className="flex gap-4 text-xs text-[var(--lighttext)] mb-8">
            <span>公開日：{publishedAt}</span>
            <span>最終更新日：{updatedAt}</span>
          </div>
          <div className="markdown-preview">
            <Markdown remarkPlugins={[remarkGfm]} components={headingComponents}>
              {content}
            </Markdown>
          </div>
        </article>

        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
