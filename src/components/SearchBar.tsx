"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TagLabel from "@/components/TagLabel";

type SearchBarProps = {
  availableTags?: string[];
  className?: string;
};

export default function SearchBar({ availableTags = [], className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`bg-[var(--inputcontainer)] h-8 flex items-center justify-between px-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] ${className ?? ""}`}>
      <div className="flex items-center gap-0.5 overflow-hidden flex-1 pr-1">
        {availableTags.map((tag) => (
          <button key={tag} type="button" onClick={() => toggleTag(tag)} className="shrink-0">
            <TagLabel label={tag} isSelected={selectedTags.includes(tag)} />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSearch}
        className="bg-white rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] p-0.5 flex items-center justify-center shrink-0 cursor-pointer"
        aria-label="検索"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5 fill-none stroke-current text-[var(--lighttext)]"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 5 5" />
        </svg>
      </button>
    </div>
  );
}
