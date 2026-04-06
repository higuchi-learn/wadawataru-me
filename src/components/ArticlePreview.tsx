import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TagsList from '@/components/TagsList';

type ArticlePreviewProps = {
  title: string;
  description: string;
  tags: string[];
  content: string;
};

export default function ArticlePreview({ title, description, tags, content }: ArticlePreviewProps) {
  return (
    <div className="flex justify-center px-1">
      <article className="w-full max-w-3xl py-6">
        {/*
          title || ... で, 左側がfalsyな値（空文字など）のときに右側を表示する。
          エディタでタイトルを何も入力していない状態でも、プレビューが空白にならないようにするため
        */}
        <h1 className="text-3xl font-bold leading-tight text-black mb-2">
          {title || <span className="text-[var(--lighttext)]">タイトル</span>}
        </h1>
        <p className="text-sm leading-6 text-[var(--lighttext)] mb-2">
          {description || <span className="italic">説明</span>}
        </p>
        <TagsList tags={tags} className="mb-2" />
        <div className="flex gap-4 text-xs text-[var(--lighttext)] mb-8">
          {/* プレビューでは日付が確定しないためダッシュを表示する */}
          <span>公開日：----年--月--日</span>
          <span>最終更新日：----年--月--日</span>
        </div>
        <div className="markdown-preview">
          {/*
            ArticlePage と違い、プレビューでは目次リンクは不要なため
            components（見出し id 付与）は渡さない
          */}
          <Markdown remarkPlugins={[remarkGfm]}>{content || '*本文がここに表示されます*'}</Markdown>
        </div>
      </article>
    </div>
  );
}
