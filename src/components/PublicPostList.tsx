'use client';

import { useSearchParams } from 'next/navigation';
import CardList, { type CardData } from '@/components/CardList';
import { SearchBarView } from '@/components/SearchBar';
import { PageBar } from '@/components/SelectPageBar';
import type { TagItem } from '@/components/TagSelectOverlay';

// 公開ページの記事一覧（検索バー・ページ送り・カード）
//
// そのジャンルの公開中の記事をすべて受け取り、URL の ?tags= と ?page= に合うものだけをブラウザ側で表示する。
// 以前はこの2つをサーバーで受けていたので、ページを作り置きにできず、アクセスのたびに組み立てていた
// （CPU 24〜121ms、リンク先の先読みもできず、移るたびに読み込み中の画面が出ていた）。
// ブラウザ側で絞り込むことで、ページ（PostListPage）は作り置きにでき、絞り込み・ページ送りもサーバーとのやりとりなしで切り替わる

// 1ページに並べる記事の数（以前のサーバー側のページ送りと同じ）
const PAGE_SIZE = 20;

type Props = {
  cards: CardData[];
  allTags: TagItem[];
};

// URL を読んで一覧を表示する部品。PostListPage で Suspense の中に置く
// useSearchParams を使う部品は、作り置きのページではブラウザでだけ描画される（サーバーでは Suspense の fallback が HTML になる）
export function PublicPostListFromUrl(props: Props) {
  const searchParams = useSearchParams();
  return <PublicPostListView {...props} query={searchParams.toString()} />;
}

// 一覧の見た目と操作。query（URL の検索パラメータの文字列）から、表示する記事を決める
// PostListPage では、Suspense の fallback に query="" で置き、サーバー側で「絞り込みなし・1ページ目」の HTML を作る
// （検索エンジンや、JavaScript が動く前の表示でも、記事が並んだ状態になる）
export function PublicPostListView({ cards, allTags, query }: Props & { query: string }) {
  const params = new URLSearchParams(query);
  // URL のタグ名のうち、このジャンルに登録されているものだけを使う（以前のサーバー側の絞り込みと同じ）
  const selectedNames = (params.get('tags')?.split(',').filter(Boolean) ?? []).filter((name) =>
    allTags.some((tag) => tag.name === name),
  );
  // 選んだタグを「すべて」持つ記事だけを残す（以前のサーバー側の絞り込みと同じ AND 条件）
  const filtered = cards.filter((card) => selectedNames.every((name) => card.tags.some((tag) => tag.name === name)));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // ページ番号が範囲外（記事が減った・URL を手で書き換えたなど）のときは、最初か最後のページにそろえる
  const currentPage = Math.min(totalPages, Math.max(1, Number(params.get('page') ?? '1') || 1));
  const pageCards = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // URL の検索パラメータだけを変える。ブラウザの履歴に積むので、戻るボタンで前の絞り込み・ページに戻れる
  // history.pushState は Next.js の useSearchParams と連動するので、PublicPostListFromUrl がすぐ描画し直す
  // （サーバーへの問い合わせは起きない）
  const navigate = (next: URLSearchParams) => {
    const search = next.toString();
    window.history.pushState(null, '', search ? `?${search}` : window.location.pathname);
    // 別のページへ移ったときと同じく、一覧の先頭から見られるように一番上へ戻す
    window.scrollTo({ top: 0 });
  };

  const changeTags = (names: string[]) => {
    const next = new URLSearchParams(query);
    if (names.length > 0) next.set('tags', names.join(','));
    else next.delete('tags');
    // 絞り込みを変えたら1ページ目から
    next.delete('page');
    navigate(next);
  };

  const changePage = (page: number) => {
    const next = new URLSearchParams(query);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    navigate(next);
  };

  return (
    <>
      {/* タグが 1 つもないジャンル（記事にタグを付けていない）では、検索バーを出しても選べるものがなく、
          押すと空の選択画面が開くだけになるので、バーごと出さない */}
      {allTags.length > 0 && (
        <div className="flex flex-col items-center pt-8 pb-2 px-4 w-full shrink-0">
          {/* max-w-full: 幅 365px 固定のままだと、365px より狭い画面（320px・360px の端末）で画面からはみ出し、
              横スクロールが出てしまう。親の幅（画面幅 - 左右の余白 16px ずつ）までは縮むようにする */}
          <SearchBarView
            availableTags={allTags}
            className="w-[365px] max-w-full"
            selectedNames={selectedNames}
            onChange={changeTags}
          />
        </div>
      )}
      <main className="flex-1 flex flex-col items-center gap-2.5 pb-16">
        {pageCards.length === 0 ? (
          // 記事が 0 件のとき。何も出さないと一覧の場所が真っ白になり、壊れているのか該当がないのか区別できない
          // タグで絞り込んだ結果が 0 件のときは、絞り込みを解除するボタンも出して、すぐ元に戻れるようにする
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
            <p className="text-sm text-[var(--lighttext)]">
              {selectedNames.length > 0 ? '選択したタグに一致する記事はありません。' : 'まだ記事がありません。'}
            </p>
            {selectedNames.length > 0 && (
              <button
                type="button"
                onClick={() => changeTags([])}
                className="text-sm font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-5 py-2 hover:bg-[var(--onmouseorange)] transition-colors"
              >
                絞り込みを解除
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center py-1 w-full">
            <PageBar totalPages={totalPages} currentPage={currentPage} onChange={changePage} />
            <CardList cards={pageCards} />
            <PageBar totalPages={totalPages} currentPage={currentPage} onChange={changePage} />
          </div>
        )}
      </main>
    </>
  );
}
