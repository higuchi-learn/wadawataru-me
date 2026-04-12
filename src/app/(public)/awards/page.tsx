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
    event: "技育CAMP ハッカソン",
    date: "2025年8月",
    description:
      "腕に装着するコントローラーで音楽を操作するシステム。作業中にスマートフォンに触れずに音楽操作できれば集中力を維持できるという着想から開発。XIAO BLE を用いたマイコン側の実装（センサー値取得・BLE 送信）と、受信データによる再生/停止/スキップなどのイベント発火ロジックを担当した。",
    insight:
      "遊び感覚で開発したものが最高賞を受賞した。「苦労して作ったものほど評価される」という思い込みを崩す体験になり、ユーザーが評価するものの本質は苦労の量ではないという気づきを得た。",
    tech: ["Next.js", "TypeScript", "C++", "XIAO BLE"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGvlxQLaRw/8fbZ3A8wx9VI0na9Rp_ppA/view" },
      { label: "GitHub (ハード)", href: "https://github.com/higuchi-learn/GestureAudio" },
    ],
  },
  {
    rank: "経済産業大臣賞",
    title: "ジュニアマイスター顕彰",
    event: "公益社団法人全国工業高等学校長協会",
    date: "2024年3月",
    description:
      "全国工業高校生対象の資格・競技会顕彰制度にて、歴代最高得点 270pt で全国1名に与えられる経済産業大臣賞を受賞。高校1年の入学直後から「経済産業大臣賞」を目標に設定して資格取得を開始し、高校3年では目標を「歴代最高得点の更新」に上書き。難関国家資格を含む15資格を高校在学中にすべて取得した。",
    insight:
      "資格取得は「多く取ること」が目的ではなかった。目標（経済産業大臣賞・歴代最高得点）を先に設定し、そこへの道筋を逆算して動いた結果が270ptだった。3年間、目標を上書きしながらブレずに継続できたことが最大の学び。",
  },
  {
    rank: "STECH 協賛賞",
    title: "Bingo!2",
    event: "SysHack（サークル主催ハッカソン）",
    date: "2025年3月",
    description:
      "紙ベースのビンゴ大会が大人数では非効率という課題を解決するため開発。ルーム・カード自動生成、抽選番号確定時のリアルタイムカード判定、リーチ・ビンゴ確率算出アルゴリズムを実装。Firestore の onSnapshot を活用したリアルタイム更新とDB設計を含め、デザイン以外の全工程をほぼ個人で担当した。",
    insight:
      "開発に AI を本格導入した最初のプロジェクト。AI が補助ツールとして機能する中で、「設計力がなければ AI も使いこなせない」という事実がより鮮明になった。コードを書く速度よりも、設計の質が成果を左右するという認識を得た。",
    tech: ["Next.js", "TypeScript", "Firebase", "Shadcn"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGjQ4RHnYU/YvluRIHCfkngv1QldyFMLQ/view" },
      { label: "GitHub", href: "https://github.com/higuchi-learn/syshack-bingo" },
    ],
  },
  {
    rank: "優秀賞（2位）",
    title: "ステキなステッキ",
    event: "技育CAMP ハッカソン vol.19",
    date: "2025年2月",
    description:
      "Raspberry Pi Pico W を用いた対戦型組み込みゲーム。センサー値を JSON でサーバーへ送信し、ゲーム状態をリアルタイムに反映する仕組みを担当。WebSocket ライブラリが MicroPython で利用不可と判明したため、毎秒 HTTP 通信＋レスポンス条件分岐による擬似リアルタイム通信を設計・実装した。",
    insight:
      "「できない理由を探す」のではなく、「この制約の中で何ができるか」を考える思考パターンが形になった経験。ベストプラクティスを知った上で状況に応じた最適解を選ぶことの重要性を体得した。",
    tech: ["MicroPython", "Raspberry Pi Pico W", "電子回路設計・実装"],
    links: [
      { label: "発表資料", href: "https://www.canva.com/design/DAGeeEF3T2U/qEBiPbFmTjxi5IjgVbHxjg/view" },
      { label: "GitHub", href: "https://github.com/higuchi-learn/lovely-stick/" },
    ],
  },
  {
    rank: "株式会社ゆめみ 企業賞",
    title: "ステキなステッキ",
    event: "技育博 2024 vol.6",
    date: "2025年2月",
    description:
      "技育博 2024 vol.6 において同作品が株式会社ゆめみ企業賞を受賞。技育CAMP ハッカソン vol.19 優秀賞と同一プロダクト。",
    insight: "同一プロダクトが複数の場で評価されたことで、制約環境での代替案設計というアプローチの普遍的な価値を感じた。",
    tech: ["MicroPython", "Raspberry Pi Pico W"],
  },
  {
    rank: "優秀賞",
    title: "SysPay",
    event: "愛知工業大学 工科展",
    date: "2024年10月",
    description:
      "大学祭の模擬店向けオンライン注文システム。Firebase 上で管理するメニューデータを動的表示し、カート管理ロジックと注文確定時のDB送信処理を実装。UI/UX 設計も担当した。",
    insight:
      "自分たちが「あったら便利」と思う課題をそのままプロダクトにした最初のチーム開発。「使われることを想定したUI設計」の難しさと面白さを同時に学んだ。",
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
