'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 以前の年表の URL（/history?order=newest）で開かれたときに、新しい順のページ（/history/newest）へ移す
// 共有されたリンクやブラウザの履歴から開かれても、新しい順で表示されるようにするため
export default function HistoryLegacyOrderRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLegacyNewest = searchParams.get('order') === 'newest';

  useEffect(() => {
    // replace: 移動前の URL を履歴に残さない（戻るボタンで再び移動させられないように）
    if (isLegacyNewest) router.replace('/history/newest');
  }, [isLegacyNewest, router]);

  return null;
}
