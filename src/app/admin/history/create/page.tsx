import HistoryEventEditor from '@/components/HistoryEventEditor';
import { getHistoryBadgesList, getHistoryArticleCandidates } from '@/db/queries/select';

export default async function HistoryEventCreatePage() {
  const [badges, articles] = await Promise.all([getHistoryBadgesList(), getHistoryArticleCandidates()]);
  return <HistoryEventEditor badges={badges.map(({ id, name }) => ({ id, name }))} articles={articles} />;
}
