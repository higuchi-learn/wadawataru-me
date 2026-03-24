export type Heading = {
  level: number;
  text: string;
  id: string;
};

export function generateHeadingId(text: string): string {
  return text
    .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // インラインコードのバッククォートを除去
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseHeadings(markdown: string): Heading[] {
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: generateHeadingId(text) });
  }
  return headings;
}
