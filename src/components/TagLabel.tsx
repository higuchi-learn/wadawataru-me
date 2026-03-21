type TagLabelProps = {
  label: string;
};

export default function TagLabel({ label }: TagLabelProps) {
  return (
    <div className="flex items-center justify-center px-1 py-px rounded-md bg-[var(--tag)]">
      <span className="text-xs leading-4 font-normal text-black whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
