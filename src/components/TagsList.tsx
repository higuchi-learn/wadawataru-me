import TagLabel from '@/components/TagLabel';

export type TagListItem = { name: string; imageUrl: string | null };

type TagsListProps = {
  tags: TagListItem[];
  className?: string;
};

export default function TagsList({ tags, className }: TagsListProps) {
  return (
    <div className={`flex items-center gap-0.5 h-[26px] overflow-hidden ${className ?? ''}`.trim()}>
      {tags.map((tag) => (
        <TagLabel key={tag.name} label={tag.name} imageUrl={tag.imageUrl} />
      ))}
    </div>
  );
}
