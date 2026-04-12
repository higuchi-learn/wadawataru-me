import type { ReactNode } from 'react';

const stats = [
  { value: "15", label: "取得資格数", note: "すべて高校在学中" },
  { value: "270pt", label: "ジュニアマイスター顕彰", note: "経済産業大臣賞・歴代最高得点" },
  { value: "3.45", label: "大学 GPA", note: "専門科目はほぼ「秀」" },
  { value: "5+", label: "ハッカソン受賞", note: "最優秀賞・優秀賞ほか" },
];

const traits = [
  {
    title: "問題を仕組みで解く",
    body: "個人の努力で補うのではなく、再発しない構造をつくる発想が一貫している。生徒会では意見収集を物理の箱からWebフォームへ切り替え、作業環境をNASでデジタル化。開発では WebSocket が使えない制約に対し HTTP ポーリングで擬似リアルタイムを実装した。",
  },
  {
    title: "根本から理解するまで向き合う",
    body: "「なんとなくわかった」では止まらない。大学の課題にAIを使わず自力で理解することを徹底。ライブラリをブラックボックスで使用して精度課題が出た失敗を反省として明記し、内部理解の重要性を自ら言語化できる。",
  },
  {
    title: "目標を先に設定し、逆算して動く",
    body: "高1で「経済産業大臣賞」を目標設定 → 高3で「歴代最高得点の更新」へ上書き → 270pt で達成。生徒会長就任前に意図的に会計・書記の両役職を経験し、現場課題を把握してから改革に臨んだ。",
  },
  {
    title: "失敗から本質的な教訓を取り出す",
    body: "生徒会の放送誤操作では「わかっているはず」という慢心を原因と特定し、全業務に手順書を整備した。技育CAMPで苦労せず作ったものが最優秀賞を取った経験から「ユーザーが評価するものは必ずしも苦労作ではない」という本質に気づいた。",
  },
  {
    title: "他者の理解プロセスに寄り添う",
    body: "ピアサポートでは「解き方を教えない」指導を徹底——コツを自分でつかんでもらうプロセスに寄り添う。エクステンションセンターでは小学生に加算器の面白さを伝えるため、教材として 23ビット加算器表示器を自作した。",
  },
  {
    title: "信頼は継続した行動の結果として積み上がる",
    body: "セブンイレブンで1年・約1000時間誠実に働いた結果として発注業務を任された。生徒会長としての改革が受け入れられたのも、会計・書記として積み上げた信頼があったから。アピールではなく行動の継続が評価を生むスタイル。",
  },
];

const skillGroups = [
  { category: "フロントエンド", items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Shadcn", "MUI"] },
  { category: "バックエンド", items: ["Python", "FastAPI", "C / C++", "Rails", "Laravel"] },
  { category: "データベース", items: ["Firebase / Firestore", "PostgreSQL", "MariaDB", "MySQL", "SQLite", "Drizzle"] },
  { category: "組み込み / ハードウェア", items: ["Arduino", "Raspberry Pi", "XIAO BLE", "MicroPython", "C++ (マイコン)"] },
  { category: "AI・機械学習", items: ["YOLO (物体検出)", "CVAT (アノテーション)", "scikit-learn (入門)"] },
  { category: "インフラ / ツール", items: ["Vercel", "Cloudflare Workers", "Figma", "Typst", "Marp"] },
];

const nowItems = [
  { label: "インターン", value: "コムスクエア（フルリモート / Web エンジニア）" },
  { label: "セキュリティ学習", value: "CTF 参加（防衛省サイバーコンテスト 2026 など）・毎月1冊の技術書読了" },
  { label: "自企画講座", value: "愛知工業大学エクステンションセンター：小学生向け電子工作体験講座を 2026年度に開催予定" },
  { label: "所属", value: "愛知工業大学 システム工学研究会 / MatsuribaTech（東海エンジニア学生コミュニティ）" },
];

function Section({
  heading,
  children,
  bg = "white",
  last = false,
}: {
  heading: string;
  children: ReactNode;
  bg?: "white" | "gray";
  last?: boolean;
}) {
  return (
    <section
      className={`${bg === "gray" ? "bg-[var(--page-bg)]" : "bg-white"} px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-16 sm:py-20 lg:py-24 xl:py-28${last ? "" : " border-b border-[var(--border)]"}`}
    >
      <div className="lg:grid lg:grid-cols-[160px_1fr] lg:gap-10 xl:grid-cols-[200px_1fr] xl:gap-16 2xl:grid-cols-[240px_1fr] 2xl:gap-20">
        <div className="mb-8 lg:mb-0 shrink-0">
          <div className="hidden lg:block w-8 h-1 bg-[var(--ogangetext)] rounded-full mb-3" />
          <h2 className="text-sm font-bold text-[var(--ogangetext)] tracking-widest uppercase">{heading}</h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-20 sm:py-28 lg:py-32 2xl:py-40">
        <div className="xl:flex xl:items-start xl:gap-16 2xl:gap-24">

          {/* テキスト */}
          <div className="text-center xl:text-left xl:flex-1">
            <p className="text-xs font-bold text-[var(--ogangetext)] mb-4 tracking-[0.2em] uppercase">Portfolio</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-bold text-black tracking-tight">
              わだわたる
            </h1>
            <p className="text-base text-[var(--lighttext)] mt-3">樋口 陽輝</p>
            <p className="text-sm text-[var(--lighttext)] mt-1">
              愛知工業大学 工学部 電気学科 電子情報工学専攻 / 3年
            </p>
            <p className="text-base text-black mt-8 max-w-lg mx-auto xl:mx-0 leading-8 font-medium">
              「好奇心を持ったことに、根本から理解するまで向き合い続ける。」
            </p>
            <p className="text-sm text-[var(--lighttext)] mt-3 max-w-md mx-auto xl:mx-0 leading-7">
              ハードとソフトを横断するフルスタックエンジニア志望。
              高校在学中に国家資格15個・経済産業大臣賞を取得。
              大学ではハッカソンで複数受賞。
            </p>
          </div>

          {/* Stats グリッド（xl+） */}
          <div className="hidden xl:grid xl:grid-cols-2 xl:gap-3 xl:shrink-0 xl:w-72 2xl:w-80">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[var(--enableorange)] rounded-xl flex flex-col items-center justify-center p-6 2xl:p-7 text-center">
                <p className="text-3xl 2xl:text-4xl font-bold text-[var(--ogangetext)]">{stat.value}</p>
                <p className="text-xs text-black mt-1.5 font-medium leading-4">{stat.label}</p>
                <p className="text-xs text-[var(--lighttext)] mt-0.5 leading-4">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats（モバイル・タブレット）────────────────────────── */}
      <section className="xl:hidden bg-[var(--enableorange)] grid grid-cols-2 md:grid-cols-4 border-b border-[var(--border)]">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-3xl font-bold text-[var(--ogangetext)]">{stat.value}</p>
            <p className="text-xs text-black mt-1 font-medium">{stat.label}</p>
            <p className="text-xs text-[var(--lighttext)] mt-0.5">{stat.note}</p>
          </div>
        ))}
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <Section heading="About" bg="gray">
        <div className="max-w-2xl space-y-5 text-sm text-black leading-7">
          <p>
            中学時代、YouTubeのガジェット動画に影響を受け、プレゼントをすべて放棄してPC自作のためのパーツ購入を選んだ。
            人生最初のパソコンを自分の手で組み上げたこの体験が、「面白いと思ったことは、手を動かして理解する」という
            自分のあり方の起点になっている。
          </p>
          <p>
            岐阜工業高等学校では電気電子・通信技術を基礎から学ぶ傍ら、高1から資格取得を開始。
            「ジュニアマイスター顕彰 経済産業大臣賞（全国1名）」という目標を設定し、
            高3では「歴代最高得点の更新」へ目標を上書きした上で達成（270pt）。
            並行して生徒会長・全国高等学校総合文化祭の広報イベント委員長を務め、組織改革・広報設計を主導した。
          </p>
          <p>
            大学では電気回路・ディジタル回路・組み込みシステム・数値計算を横断的に学びながら、
            サークル（システム工学研究会）でのチーム開発・ハッカソン参加を重ねている。
            学習においてはAIに頼らず自力で理解することを徹底しており、
            「なんとなくわかった」では止まらない——これは意識的な努力ではなく、自然にそうなっている性質だ。
          </p>
          <p>
            現在はフルスタックエンジニアを目指しつつ、セキュリティ・フロントエンド・バックエンドを横断して習得中。
            CTFへの参加・毎月1冊の技術書読了を継続している。
          </p>
        </div>
      </Section>

      {/* ── Character ────────────────────────────────────────── */}
      <Section heading="Character">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {traits.map((trait, i) => (
            <div key={i} className="bg-[var(--page-bg)] rounded-xl p-5 xl:p-6">
              <h3 className="text-sm font-bold text-black mb-2">{trait.title}</h3>
              <p className="text-sm text-[var(--lighttext)] leading-6">{trait.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Skills ───────────────────────────────────────────── */}
      <Section heading="Skills" bg="gray">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {skillGroups.map((group) => (
            <div key={group.category} className="bg-white rounded-xl p-5">
              <h3 className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs text-[var(--lighttext)] border border-[var(--border)] rounded-full px-2.5 py-0.5"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Now ──────────────────────────────────────────────── */}
      <Section heading="Now">
        <div className="max-w-2xl divide-y divide-[var(--border)]">
          {nowItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4"
            >
              <p className="text-xs font-bold text-[var(--ogangetext)] w-28 shrink-0 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm text-black leading-6">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Links ────────────────────────────────────────────── */}
      <Section heading="Links" bg="gray" last>
        <div className="flex gap-8">
          <a
            href="https://github.com/higuchi-learn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            GitHub
          </a>
          <a
            href="https://x.com/wadawataru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            X (Twitter)
          </a>
        </div>
      </Section>

    </div>
  );
}
