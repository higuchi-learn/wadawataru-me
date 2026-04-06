'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import SquareButton from '@/components/SquareButton';

type Status = 'draft' | 'published' | 'archived';

const STATUS_ITEMS: { value: Status; label: string }[] = [
  { value: 'draft', label: '未公開' },
  { value: 'published', label: '公開中' },
  { value: 'archived', label: 'アーカイブ済' },
];

export default function StatusBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?status= がない場合はデフォルトで 'draft'（未公開）を表示する
  const selected = (searchParams.get('status') ?? 'draft') as Status;

  const setStatus = (status: Status) => {
    // SearchBar と同様に既存のパラメータを保持しつつ status だけ更新する
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    // ステータスを切り替えたらページを1に戻す
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-[var(--inputcontainer)] flex items-center gap-1 p-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)]">
      {STATUS_ITEMS.map(({ value, label }) => (
        <SquareButton key={value} state={selected === value ? 'Enabled' : 'Disabled'} onClick={() => setStatus(value)}>
          {label}
        </SquareButton>
      ))}
    </div>
  );
}
