import TagLabel from '@/components/TagLabel';

type TagsListProps = {
  tags: string[];
  className?: string;
};

export default function TagsList({ tags, className }: TagsListProps) {
  return (
    <div className={`flex items-center gap-0.5 h-[26px] overflow-hidden ${className ?? ''}`.trim()}>
      {tags.map((tag) => (
        <TagLabel key={tag} label={tag} />
      ))}
    </div>
  );
}
