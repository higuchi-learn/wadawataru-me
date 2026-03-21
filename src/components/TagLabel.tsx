type TagLabelProps = {
  label: string;
  isSelected?: boolean;
};

export default function TagLabel({ label, isSelected }: TagLabelProps) {
  return (
    <div className={`flex items-center justify-center px-1 py-px rounded-md bg-[var(--tag)] ${isSelected ? "ring-1 ring-[var(--ogangetext)]" : ""}`}>
      <span className="text-xs leading-4 font-normal text-black whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
