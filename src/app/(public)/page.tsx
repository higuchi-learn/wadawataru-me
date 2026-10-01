import type { ReactNode } from 'react';

const stats = [
  { value: "15", label: "取得資格数", note: "すべて高校在学中" },
  { value: "270pt", label: "ジュニアマイスター顕彰", note: "経済産業大臣賞・歴代最高得点" },
  { value: "3.5", label: "大学 GPA", note: "専門科目はほぼ「秀」" },
  { value: "5+", label: "ハッカソン受賞", note: "最優秀賞・優秀賞ほか" },
];

const traits = [
  {
    title: "仕組みで解決したい",
    body: "人の頑張りでカバーするより、同じ問題が起きない仕組みを作るほうが好きです。生徒会では紙の意見箱をWebフォームに切り替えたり、作業環境をNASでデジタル化したりしました。開発でも、WebSocket が使えなかったときに HTTP ポーリングで擬似的なリアルタイム通信を実装しました。",
  },
  {
    title: "わかるまで調べる",
    body: "わかったつもりのままにしておくのが苦手です。大学の課題はAIを使わずに自分で解くようにしています。ライブラリの中身を理解しないまま使って認識精度で苦労したこともあり、使う技術の仕組みはできるだけ理解しておきたいと思っています。",
  },
  {
    title: "目標を決めてから動く",
    body: "高1のときにジュニアマイスター顕彰の経済産業大臣賞を目標にし、高3では歴代最高得点の更新に目標を引き上げて、270pt で受賞しました。生徒会でも、会長になる前に会計と書記を経験して、実際の業務を知ってから改革に取り組みました。",
  },
  {
    title: "失敗から学ぶ",
    body: "生徒会で放送の操作ミスをしたときは「わかっているつもり」だったことが原因だと考え、すべての業務に手順書を作りました。技育CAMPでは遊び感覚で作ったものが最優秀賞をもらい、苦労の量と評価は必ずしも比例しないことを知りました。",
  },
  {
    title: "人に教えること",
    body: "ピアサポートでは、解き方をそのまま教えるのではなく、本人がコツをつかめるように一緒に考えることを意識していました。エクステンションセンターでは、小学生に加算器の面白さを伝えるために 23ビット加算器表示器を自作しました。",
  },
  {
    title: "コツコツ続ける",
    body: "セブンイレブンでは約1年で1,000時間ほど働き、発注業務を任せてもらえるようになりました。生徒会長としての改革を受け入れてもらえたのも、会計・書記の頃から地道に仕事をしてきたからだと思っています。",
  },
];

const skillGroups = [
  { category: "フロントエンド", items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Shadcn", "MUI"] },
  { category: "バックエンド", items: ["Python", "FastAPI", "C / C++", "Rails", "Laravel", "MVC"] },
  { category: "データベース", items: ["Firebase / Firestore", "PostgreSQL", "MariaDB", "MySQL", "SQLite", "Drizzle"] },
  { category: "組み込み / ハードウェア", items: ["Arduino", "Raspberry Pi", "XIAO BLE", "MicroPython", "C++ (マイコン)", "VHDL / FPGA", "回路設計", "JW_CAD", "TINA-TI"] },
  { category: "AI・機械学習", items: ["YOLO (物体検出)", "CVAT (アノテーション)", "scikit-learn (入門)", "Unity (連携)"] },
  { category: "インフラ / ツール", items: ["Vercel", "Cloudflare Workers", "Neon", "AWS (学習中)", "Figma", "Typst", "Marp"] },
];

const profileItems = [
  { label: "活動名", value: "わだわたる" },
  { label: "趣味", value: "料理、VALORANT、旅行、書道、電子工作、資格取得" },
  { label: "MBTI", value: "ISTP（巨匠）" },
];

const nowItems = [
  { label: "インターン", value: "コムスクエア（フルリモート / Web エンジニア）。2026年は SmartHR・kubell・ディップなど計9社の短期インターンに参加しました" },
  { label: "セキュリティ学習", value: "CTF 参加（防衛省サイバーコンテスト 2026 など）・毎月1冊の技術書読了" },
  { label: "自企画講座", value: "2026年8月、愛知工業大学「まるごと体験ワールド」で小学生向け講座「コンピューターに『1+1＝10』って言わせてみよう！」を開催しました" },
  { label: "技術発信", value: "Qiita で記事を公開しています（Next.js + Neon + Cloudflare Workers の構築記事など）" },
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
            <p className="text-sm text-[var(--lighttext)] mt-5 max-w-md mx-auto xl:mx-0 leading-7">
              ハードとソフトの両方がわかるフルスタックエンジニアを目指しています。
              高校在学中に15の資格を取り、経済産業大臣賞をいただきました。
              大学ではこれまでに7つのプロダクトを開発し、ハッカソンでもいくつか賞をいただいています。
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
            中学生のころ、YouTubeのガジェット動画を見てPCを自作してみたくなり、
            中学時代のプレゼントをすべてあきらめる代わりにパーツを買って、初めてのPCを自分で組み立てました。
            気になったものは自分で手を動かして確かめたくなるのは、このころから変わっていません。
          </p>
          <p>
            高校は岐阜工業高等学校の電子工学科に進み、電気電子や通信を基礎から学びました。
            資格の勉強は高1から始め、ジュニアマイスター顕彰の経済産業大臣賞（全国1名）を目標にしていました。
            高3では歴代最高得点の更新を目標にし、270pt で受賞しました。
            並行して、生徒会長や全国高等学校総合文化祭の広報イベント委員長も務めました。
          </p>
          <p>
            大学では電気回路・ディジタル回路・組み込みシステム・数値計算などを学びながら、
            システム工学研究会というサークルでチーム開発やハッカソンに参加しています。
            授業の課題はAIに頼らず、自分で理解しながら解くようにしています。
          </p>
          <p>
            将来は、プロダクト全体を理解したうえで、安心して長く使ってもらえるものを作れるフルスタックエンジニアになりたいと考えています。
            特にセキュリティに興味があり、いずれはセキュリティエンジニアとして働きたいです。
            長期休みにはプロダクトを1つ作るようにしていて、CTFへの参加（防衛省サイバーコンテスト 学生上位50%）や、毎月1冊技術書を読むことも続けています。
            職場では、技術のことなら何でも聞いてもらえるような上司になるのが目標です。
          </p>
        </div>
        <dl className="max-w-2xl mt-8 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {profileItems.map((item) => (
            <div key={item.label} className="flex gap-6 py-3">
              <dt className="text-xs font-bold text-[var(--ogangetext)] w-28 shrink-0 uppercase tracking-wide pt-0.5">{item.label}</dt>
              <dd className="text-sm text-black leading-6">{item.value}</dd>
            </div>
          ))}
        </dl>
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
            href="https://x.com/hig270"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            X (Twitter)
          </a>
          <a
            href="https://www.wantedly.com/id/haruki_higuchi_000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            Wantedly
          </a>
          <a
            href="https://qiita.com/wada_wataru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            Qiita
          </a>
        </div>
      </Section>

    </div>
  );
}
