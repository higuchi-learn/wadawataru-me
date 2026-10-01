type Award = {
  rank: string;
  title: string;
  event: string;
  date: string;
  description: string;
  insight: string;
  tech?: string[];
  links?: { label: string; href: string }[];
};

const awards: Award[] = [
  {
    rank: "最優秀賞",
    title: "Gesture Audio",
    event: "技育CAMP2025 ハッカソン Vol.10",
    date: "2025年8月",
    description:
      "腕に着けたコントローラーで音楽を操作するシステムです。作業中にスマートフォンを触らずに音楽を操作できれば集中が途切れないのでは、と考えて作りました。私はハードウェア側を担当し、XIAO BLE Sense を使った腕装着型コントローラーの回路設計・実装、マイコン側の処理（6軸加速度センサーの値の取得・BLE 送信）、受信したデータから再生/停止/スキップなどの操作を行う処理を作りました。",
    insight:
      "遊び感覚で作ったものが最優秀賞をもらえたのは意外でした。苦労して作ったものほど評価される、というわけではないんだと実感しました。",
    tech: ["C++", "XIAO BLE Sense", "BLE", "6軸加速度センサー"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGvlxQLaRw/8fbZ3A8wx9VI0na9Rp_ppA/view" },
      { label: "GitHub (ハード)", href: "https://github.com/higuchi-learn/GestureAudio" },
      { label: "GitHub (フロント)", href: "https://github.com/rinyaaa/Music" },
    ],
  },
  {
    rank: "経済産業大臣賞",
    title: "ジュニアマイスター顕彰",
    event: "公益社団法人全国工業高等学校長協会",
    date: "2024年3月",
    description:
      "全国の工業高校生を対象にした資格・競技会の顕彰制度で、歴代最高得点の 270pt を取り、全国1名に贈られる経済産業大臣賞をいただきました。高1の入学直後からこの賞を目標に資格の勉強を始め、高3では歴代最高得点の更新を目標にしました。高校在学中に、難関の国家資格を含む15の資格を取得しました。",
    insight:
      "資格の数を増やすこと自体が目的だったわけではなく、先に目標を決めて、そこから逆算して勉強の計画を立てていました。3年間続けられたのは、目標がはっきりしていたからだと思います。",
  },
  {
    rank: "STECH 協賛賞",
    title: "Bingo!2",
    event: "システム工学研究会 SysHack（サークル主催ハッカソン）",
    date: "2025年3月",
    description:
      "紙のビンゴ大会は大人数だと手間がかかるので、それを解消するために作ったアプリです。ルームとカードの自動生成、抽選番号が出たときのカード判定、リーチ・ビンゴ確率の計算、順位のリアルタイム表示、ルール変更などを実装しました。パソコン1台と参加者のスマホがあれば、すぐに大人数でビンゴ大会ができます。Firestore の onSnapshot を使ったリアルタイム更新やDB設計も含めて、デザイン以外はほぼ一人で作りました。",
    insight:
      "AI を本格的に使って開発した最初のプロジェクトです。AI があっても、設計がしっかりしていないとうまく使いこなせないことがよくわかりました。また、参加人数が多いと Firestore の読み書き回数がすぐに無料枠を超えてしまうことがわかったので、そもそもデータを保存する必要があるのか、というところから作り直すことを考えています。",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Shadcn"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGjQ4RHnYU/YvluRIHCfkngv1QldyFMLQ/view" },
      { label: "GitHub", href: "https://github.com/higuchi-learn/syshack-bingo" },
    ],
  },
  {
    rank: "株式会社ゆめみ 企業賞",
    title: "ステキなステッキ",
    event: "技育博 2024 vol.6",
    date: "2025年2月",
    description:
      "技育博 2024 vol.6 で、株式会社ゆめみ企業賞をいただきました。技育CAMP2024 ハッカソン Vol.19 で優秀賞をもらったものと同じプロダクトです。",
    insight:
      "ハッカソンのあとに別のイベントでも評価してもらえて、制約のある中で工夫した部分がちゃんと伝わったのだと感じました。",
    tech: ["MicroPython", "Raspberry Pi Pico W"],
  },
  {
    rank: "優秀賞（2位）",
    title: "ステキなステッキ",
    event: "技育CAMP2024 ハッカソン Vol.19",
    date: "2024年12月",
    description:
      "魔法の杖で「MPを溜める・攻撃する・守る」を選び、相手のHPを0にしたら勝ちになる、体を動かして遊ぶ対戦ゲームです。回路を小型化し、画面を見なくても音で操作がわかるようにしました。私は Raspberry Pi Pico W を使った組み込み部分を担当し、センサーの値を JSON でサーバーに送ってゲームの状態に反映させる仕組みを作りました。MicroPython では WebSocket のライブラリが使えなかったので、毎秒 HTTP で通信してレスポンスで処理を分けることで、擬似的にリアルタイム通信を実現しました。",
    insight:
      "WebSocket が使えないとわかったときに、ほかの方法で同じことができないかを考えて乗り切れたのが印象に残っています。定番のやり方を知ったうえで、状況に合わせて別の方法を選ぶことも大事だと感じました。",
    tech: ["MicroPython", "Raspberry Pi Pico W", "電子回路設計・実装"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGeeEF3T2U/qEBiPbFmTjxi5IjgVbHxjg/view" },
      { label: "GitHub", href: "https://github.com/higuchi-learn/lovely-stick/" },
    ],
  },
  {
    rank: "優秀賞",
    title: "SysPay",
    event: "愛知工業大学 工科展2024",
    date: "2024年10月",
    description:
      "大学祭の模擬店向けのオンライン注文システムです。Firebase で管理しているメニューを表示する部分、カートの処理、注文確定時にDBへ送信する処理を作り、UI/UX の設計も担当しました。",
    insight:
      "自分たちが「あったら便利」と思ったものを作った、初めてのチーム開発です。実際に使われることを考えて UI を作るのは、難しくもあり面白くもありました。",
    tech: ["TypeScript", "React", "Vite", "MUI", "Firebase"],
    links: [
      { label: "発表スライド", href: "https://www.canva.com/design/DAGSrHNGRIw/y1oNjd8OxhFOz_jY8sraYQ/view" },
      { label: "GitHub", href: "https://github.com/SystemEngineeringTeam/sys_ordering_app" },
    ],
  },
];

export default function AwardsPage() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ページタイトル */}
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <p className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">Records</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">受賞歴</h1>
      </div>

      {/* 受賞一覧 */}
      <div className="px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          {awards.map((award, i) => (
            <div key={`${award.event}-${i}`} className="bg-[var(--page-bg)] rounded-2xl p-6 sm:p-7 flex flex-col gap-4">

              {/* ヘッダ */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <span className="inline-block text-xs font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-3 py-1 mb-3">
                    {award.rank}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-black leading-tight">{award.title}</h2>
                  <p className="text-sm text-[var(--lighttext)] mt-1">{award.event}</p>
                </div>
                <p className="text-xs text-[var(--lighttext)] shrink-0 sm:pt-1">{award.date}</p>
              </div>

              {/* 説明 */}
              <p className="text-sm text-black leading-7">{award.description}</p>

              {/* 学び・気づき */}
              <div className="bg-[var(--enableorange)] rounded-xl p-4">
                <p className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-2">
                  学び・気づき
                </p>
                <p className="text-sm text-black leading-7">{award.insight}</p>
              </div>

              {/* tech + links */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-auto pt-1">
                {award.tech && (
                  <div className="flex flex-wrap gap-1.5">
                    {award.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs text-[var(--lighttext)] border border-[var(--border)] rounded-full px-2.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {award.links && (
                  <div className="flex flex-wrap gap-4 sm:ml-auto">
                    {award.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
