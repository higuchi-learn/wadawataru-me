import HistoryEventEditor from '@/components/HistoryEventEditor';
import { getHistoryBadgesList } from '@/db/queries/select';

export default async function HistoryEventCreatePage() {
  const badges = await getHistoryBadgesList();
  return <HistoryEventEditor badges={badges.map(({ id, name }) => ({ id, name }))} />;
}
