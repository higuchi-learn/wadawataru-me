import { notFound } from 'next/navigation';
import HistoryEventEditor from '@/components/HistoryEventEditor';
import { getHistoryEventById, getHistoryBadgesList } from '@/db/queries/select';
import { formatSavedAt } from '@/lib/formatDate';

// id は uuid なので、形式が違う値で DB に問い合わせると型エラーになる。先に弾いて 404 にする
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function HistoryEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const [event, badges] = await Promise.all([getHistoryEventById(id), getHistoryBadgesList()]);
  if (!event) notFound();

  return (
    <HistoryEventEditor
      id={event.id}
      savedAt={formatSavedAt(event.updatedAt)}
      badges={badges.map(({ id: badgeId, name }) => ({ id: badgeId, name }))}
      initialData={{
        era: event.era,
        sortDate: event.sortDate,
        dateLabel: event.dateLabel,
        kind: event.kind,
        badgeId: event.badgeId ?? '',
        title: event.title,
        summary: event.summary ?? '',
        content: event.content,
        thumbnail: event.thumbnail ?? '',
        productSlug: event.productSlug ?? '',
        period: event.ongoing ? 'ongoing' : event.endDate ? 'ended' : 'none',
        endDate: event.endDate ?? '',
      }}
    />
  );
}
