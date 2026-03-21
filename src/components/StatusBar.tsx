"use client";

import { useState } from "react";
import SquareButton from "@/components/SquareButton";

type Status = "draft" | "published" | "archived";

const STATUS_ITEMS: { value: Status; label: string }[] = [
  { value: "draft", label: "未公開" },
  { value: "published", label: "公開中" },
  { value: "archived", label: "アーカイブ済" },
];

export default function StatusBar() {
  const [selected, setSelected] = useState<Status>("draft");

  return (
    <div className="bg-[var(--inputcontainer)] flex items-center gap-1 p-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)]">
      {STATUS_ITEMS.map(({ value, label }) => (
        <SquareButton
          key={value}
          state={selected === value ? "Enabled" : "Disabled"}
          onClick={() => setSelected(value)}
        >
          {label}
        </SquareButton>
      ))}
    </div>
  );
}
