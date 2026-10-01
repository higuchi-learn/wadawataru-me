import Link from 'next/link';
import ImageSlot from '@/components/ImageSlot';
import { PX, CARD_SHADOW, CARD_FOOTER, Section, Watermark } from '@/components/PageSection';
import MoreDetails from '@/components/MoreDetails';

// ─────────────────────────────────────────────────────────────
// 画像の差し替え方
//   1. 画像を public/images/top/ に置く（例: public/images/top/hero.webp）
//   2. 下のデータの image に "/images/top/hero.webp" のようにパスを書く
//   image が未指定の間は、ImageSlot が「何の画像を入れるか」を表示する
// ─────────────────────────────────────────────────────────────

// ヒーローの写真。アバターやイラストでもよい（正方形推奨）
const heroImage: string | undefined = undefined;

const stats = [
  { value: "15", label: "取得資格数", note: "すべて高校在学中" },
  { value: "270pt", label: "ジュニアマイスター顕彰", note: "経済産業大臣賞・歴代最高得点" },
  { value: "3.5", label: "大学 GPA", note: "専門科目はほぼ「秀」" },
  { value: "5+", label: "ハッカソン受賞", note: "最優秀賞・優秀賞ほか" },
];

// icon は Simple Icons（https://simpleicons.org）のスラッグ。
// ロゴが存在しない技術（MVC・回路設計など）は icon を省略し、頭文字で代用する。
type Skill = { name: string; icon?: string };

type Work = {
  title: string;
  // 一言で「何を作ったか」がわかる説明。長い説明は /awards や GitHub に任せる
  catchcopy: string;
  award: string;
  image?: string;
  imageHint: string;
  tech: Skill[];
  href: string;
};

const works: Work[] = [
  {
    title: "Gesture Audio",
    catchcopy: "腕を振るだけで音楽を操作できる、腕に着けるコントローラー",
    award: "最優秀賞",
    imageHint: "腕に着けたコントローラーの写真、またはデモの様子（16:9）",
    tech: [
      { name: "C++", icon: "cplusplus" },
    ],
    href: "https://github.com/higuchi-learn/GestureAudio",
  },
  {
    title: "ステキなステッキ",
    catchcopy: "魔法の杖を振って MP を溜め、攻撃・防御する体感型の対戦ゲーム",
    award: "優秀賞 ＋ ゆめみ企業賞",
    imageHint: "杖を振って遊んでいる様子、または杖の実物（16:9）",
    tech: [
      { name: "MicroPython", icon: "micropython" },
      { name: "Raspberry Pi Pico W", icon: "raspberrypi" },
    ],
    href: "https://github.com/higuchi-learn/lovely-stick/",
  },
  {
    title: "Bingo!2",
    catchcopy: "PC 1台と参加者のスマホだけで、大人数のビンゴ大会ができるアプリ",
    award: "STECH 協賛賞",
    imageHint: "ビンゴカードやランキング画面のスクリーンショット（16:9）",
    tech: [
      { name: "Next.js", icon: "nextdotjs" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Firebase", icon: "firebase" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
    href: "https://github.com/higuchi-learn/syshack-bingo",
  },
  {
    title: "SysPay",
    catchcopy: "大学祭の模擬店で使う、スマホから注文できるオンライン注文システム",
    award: "優秀賞",
    imageHint: "メニュー画面やカート画面のスクリーンショット（16:9）",
    tech: [
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Firebase", icon: "firebase" },
      { name: "MUI", icon: "mui" },
    ],
    href: "https://github.com/SystemEngineeringTeam/sys_ordering_app",
  },
];

// これまでの歩み。文章で語っていた About を、横に流れる年表に置き換えている
const story = [
  {
    period: "中学",
    title: "初めての PC 自作",
    body: "中学時代のプレゼントをあきらめてパーツを買い、自分で組み立てた",
    imageHint: "初めて組んだ PC の写真",
  },
  {
    period: "高校",
    title: "岐阜工業高校 電子工学科",
    body: "電気電子・通信を基礎から学び、生徒会長も務めた",
    imageHint: "高校・生徒会活動の写真",
  },
  {
    period: "高3",
    title: "経済産業大臣賞",
    body: "15の資格を取り、歴代最高の 270pt で全国1名の賞を受賞",
    imageHint: "表彰式や賞状の写真",
  },
  {
    period: "大学",
    title: "愛知工業大学",
    body: "サークルのチーム開発やハッカソンで、7つのプロダクトを開発",
    imageHint: "ハッカソンでの発表やチームの写真",
  },
  {
    period: "これから",
    title: "フルスタック × セキュリティ",
    body: "安心して長く使ってもらえるものを作れるエンジニアへ",
    imageHint: "（任意）CTF や勉強会の写真",
  },
];

const hobbies = ["料理", "VALORANT", "旅行", "書道", "電子工作", "資格取得"];

// catchcopy で一言だけ見せ、本文は「くわしく」を開いた人だけが読む
const traits = [
  {
    title: "仕組みで解決したい",
    catchcopy: "頑張りでカバーするより、同じ問題が起きない仕組みを作る",
    body: "人の頑張りでカバーするより、同じ問題が起きない仕組みを作るほうが好きです。生徒会では紙の意見箱をWebフォームに切り替えたり、作業環境をNASでデジタル化したりしました。開発でも、WebSocket が使えなかったときに HTTP ポーリングで擬似的なリアルタイム通信を実装しました。",
  },
  {
    title: "わかるまで調べる",
    catchcopy: "わかったつもりにしない。仕組みまで理解して使う",
    body: "わかったつもりのままにしておくのが苦手です。大学の課題はAIを使わずに自分で解くようにしています。ライブラリの中身を理解しないまま使って認識精度で苦労したこともあり、使う技術の仕組みはできるだけ理解しておきたいと思っています。",
  },
  {
    title: "目標を決めてから動く",
    catchcopy: "ゴールから逆算して、3年かけて大臣賞へ",
    body: "高1のときにジュニアマイスター顕彰の経済産業大臣賞を目標にし、高3では歴代最高得点の更新に目標を引き上げて、270pt で受賞しました。生徒会でも、会長になる前に会計と書記を経験して、実際の業務を知ってから改革に取り組みました。",
  },
  {
    title: "失敗から学ぶ",
    catchcopy: "ミスの原因を探り、手順書で再発を防ぐ",
    body: "生徒会で放送の操作ミスをしたときは「わかっているつもり」だったことが原因だと考え、すべての業務に手順書を作りました。技育CAMPでは遊び感覚で作ったものが最優秀賞をもらい、苦労の量と評価は必ずしも比例しないことを知りました。",
  },
  {
    title: "人に教えること",
    catchcopy: "答えではなく、コツをつかむ手助けをする",
    body: "ピアサポートでは、解き方をそのまま教えるのではなく、本人がコツをつかめるように一緒に考えることを意識していました。エクステンションセンターでは、小学生に加算器の面白さを伝えるために 23ビット加算器表示器を自作しました。",
  },
  {
    title: "コツコツ続ける",
    catchcopy: "1年で1,000時間。積み重ねで信頼をつくる",
    body: "セブンイレブンでは約1年で1,000時間ほど働き、発注業務を任せてもらえるようになりました。生徒会長としての改革を受け入れてもらえたのも、会計・書記の頃から地道に仕事をしてきたからだと思っています。",
  },
];

const skillGroups: { category: string; items: Skill[] }[] = [
  {
    category: "フロントエンド",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextdotjs" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Shadcn", icon: "shadcnui" },
      { name: "MUI", icon: "mui" },
    ],
  },
  {
    category: "バックエンド",
    items: [
      { name: "Python", icon: "python" },
      { name: "FastAPI", icon: "fastapi" },
      { name: "C / C++", icon: "cplusplus" },
      { name: "Rails", icon: "rubyonrails" },
      { name: "Laravel", icon: "laravel" },
      { name: "MVC" },
    ],
  },
  {
    category: "データベース",
    items: [
      { name: "Firebase / Firestore", icon: "firebase" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MariaDB", icon: "mariadb" },
      { name: "MySQL", icon: "mysql" },
      { name: "SQLite", icon: "sqlite" },
      { name: "Drizzle", icon: "drizzle" },
    ],
  },
  {
    category: "組み込み / ハードウェア",
    items: [
      { name: "Arduino", icon: "arduino" },
      { name: "Raspberry Pi", icon: "raspberrypi" },
      { name: "XIAO BLE" },
      { name: "MicroPython", icon: "micropython" },
      { name: "C++ (マイコン)", icon: "cplusplus" },
      { name: "VHDL / FPGA" },
      { name: "回路設計" },
      { name: "JW_CAD" },
      { name: "TINA-TI" },
    ],
  },
  {
    category: "AI・機械学習",
    items: [
      { name: "YOLO (物体検出)", icon: "yolo" },
      { name: "CVAT (アノテーション)" },
      { name: "scikit-learn (入門)", icon: "scikitlearn" },
      { name: "Unity (連携)", icon: "unity" },
    ],
  },
  {
    category: "インフラ / ツール",
    items: [
      { name: "Vercel", icon: "vercel" },
      { name: "Cloudflare Workers", icon: "cloudflareworkers" },
      { name: "Neon", icon: "neon" },
      // AWS は商標の都合で Simple Icons から削除されているため頭文字で代用
      { name: "AWS (学習中)" },
      { name: "Figma", icon: "figma" },
      { name: "Typst", icon: "typst" },
      { name: "Marp" },
    ],
  },
];

// headline を大きく見せ、detail は補足として小さく添える
const nowItems = [
  {
    label: "インターン",
    headline: "コムスクエアで Web エンジニア",
    detail: "フルリモートで勤務。2026年は SmartHR・kubell・ディップなど計9社の短期インターンにも参加しました",
  },
  {
    label: "セキュリティ学習",
    headline: "CTF と、毎月1冊の技術書",
    detail: "防衛省サイバーコンテスト 2026 などに参加しています",
  },
  {
    label: "自企画講座",
    headline: "小学生に「1+1＝10」を教える",
    detail: "2026年8月、愛知工業大学「まるごと体験ワールド」で小学生向けの講座を開催しました",
  },
  {
    label: "技術発信",
    headline: "Qiita で記事を公開中",
    detail: "Next.js + Neon + Cloudflare Workers の構築記事など",
  },
  {
    label: "所属",
    headline: "システム工学研究会 / MatsuribaTech",
    detail: "愛知工業大学のサークルと、東海エンジニア学生コミュニティ",
  },
];

const links = [
  { label: "GitHub", icon: "github", href: "https://github.com/higuchi-learn" },
  { label: "X", icon: "x", href: "https://x.com/hig270" },
  { label: "Wantedly", icon: "wantedly", href: "https://www.wantedly.com/id/haruki_higuchi_000" },
  { label: "Qiita", icon: "qiita", href: "https://qiita.com/wada_wataru" },
];

// ─────────────────────────────────────────────────────────────

function TechLogo({ icon, name, size = 16 }: { icon: string; name: string; size?: number }) {
  return (
    // next/image は外部画像の最適化設定（remotePatterns 等）が必要で、
    // 小さな SVG では恩恵もないため素の <img> を使う
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.simpleicons.org/${icon}`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size }}
      className="shrink-0"
    />
  );
}

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      {/* relative + overflow-hidden で、背景のぼかし円がはみ出してもスクロールが出ないようにする */}
      <section className={`relative overflow-hidden bg-[var(--cream)] ${PX} pt-14 pb-12 sm:pt-20 lg:pt-24 lg:pb-16`}>
        {/* 背景の装飾。blur で輪郭を消し、柔らかい光のように見せている */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-[var(--onmouseorange)] opacity-60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-[var(--tag)] opacity-20 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-12 lg:gap-16">

          {/* テキスト */}
          <div className="text-center lg:text-left">
            <p className="inline-block text-sm font-bold text-[var(--ogangetext)] bg-white rounded-full px-4 py-1.5 shadow-sm">
              はじめまして！
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-bold text-black tracking-tight mt-5">
              わだわたる
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-black mt-5 leading-snug">
              ハードもソフトも、<span className="text-[var(--ogangetext)]">手を動かして</span>つくる。
            </p>
            <p className="text-sm text-[var(--lighttext)] mt-4">
              樋口 陽輝 ／ 愛知工業大学 電子情報工学専攻 3年
            </p>

            {/* 行動を促すボタン。読む前に「作品を見る」へ誘導する */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8">
              <a
                href="#works"
                className="text-sm font-bold text-white bg-[var(--ogangetext)] rounded-full px-6 py-3 shadow-md shadow-orange-200 hover:brightness-110 transition"
              >
                つくったものを見る →
              </a>
              <Link
                href="/career"
                className="text-sm font-bold text-black bg-white rounded-full px-6 py-3 shadow-sm hover:text-[var(--ogangetext)] transition"
              >
                経歴を見る
              </Link>
            </div>
          </div>

          {/* 写真＋浮かぶバッジ */}
          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
            <ImageSlot
              src={heroImage}
              alt="わだわたる"
              hint="本人の写真・アバター・イラスト（正方形）"
              className="w-full aspect-square rounded-[2.5rem] shadow-xl"
            />
            {/* 少し傾けたバッジで、写真にステッカーを貼ったような遊びを出す */}
            <div className="absolute -top-4 -left-4 sm:-left-10 bg-white rounded-2xl shadow-lg px-4 py-2.5 -rotate-6">
              <p className="text-xs text-[var(--lighttext)]">全国1名</p>
              <p className="text-sm font-bold text-black">経済産業大臣賞</p>
            </div>
            <div className="absolute -bottom-5 -right-3 sm:-right-8 bg-white rounded-2xl shadow-lg px-4 py-2.5 rotate-3">
              <p className="text-xs text-[var(--lighttext)]">ハッカソン</p>
              <p className="text-sm font-bold text-black">5回以上受賞</p>
            </div>
          </div>
        </div>

        {/* 数字カード。大きな数字は読まなくても目に入るので、ヒーローの直下に置く */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-16 lg:mt-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 backdrop-blur rounded-2xl shadow-sm flex flex-col items-center justify-center px-3 py-6 text-center"
            >
              {/* 数値は途中で折り返さないよう nowrap */}
              <p className="text-3xl sm:text-4xl font-bold text-[var(--ogangetext)] whitespace-nowrap leading-none">{stat.value}</p>
              {/* text-balance で折り返し時に行の長さを揃え、1文字だけ次行に残るのを防ぐ */}
              <p className="text-xs text-black mt-3 font-bold leading-5 text-balance">{stat.label}</p>
              <p className="text-xs text-[var(--lighttext)] mt-0.5 leading-5 text-balance">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Works ────────────────────────────────────────────── */}
      {/* ポートフォリオの主役。画像を大きく見せ、説明は一言だけにしている */}
      <Section id="works" en="Works" ja="つくったもの">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {works.map((work) => (
            <a
              key={work.title}
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-white rounded-3xl overflow-hidden flex flex-col ${CARD_SHADOW}`}
            >
              <div className="relative">
                <ImageSlot src={work.image} alt={work.title} hint={work.imageHint} className="w-full aspect-video" />
                <span className="absolute top-4 left-4 text-xs font-bold text-white bg-[var(--ogangetext)] rounded-full px-3 py-1.5 shadow-md">
                  {work.award}
                </span>
              </div>
              <div className="p-5 sm:p-6 flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-bold text-black group-hover:text-[var(--ogangetext)] transition-colors">
                  {work.title}
                </h3>
                <p className="text-sm text-[var(--lighttext)] leading-6">{work.catchcopy}</p>
                {/* CARD_FOOTER の mt-auto で技術ロゴをカード下端に揃える */}
                <div className={CARD_FOOTER}>
                  <div className="flex items-center gap-2">
                    {work.tech.map((t) =>
                      t.icon ? (
                        <span key={t.name} title={t.name} className="bg-[var(--cream)] rounded-lg p-1.5">
                          <TechLogo icon={t.icon} name={t.name} size={18} />
                        </span>
                      ) : null,
                    )}
                  </div>
                  <span className="text-sm font-bold text-[var(--ogangetext)]">GitHub ↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link href="/products" className="text-sm font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-6 py-3 hover:bg-[var(--onmouseorange)] transition-colors">
            プロダクト一覧へ →
          </Link>
          <Link href="/awards" className="text-sm font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-6 py-3 hover:bg-[var(--onmouseorange)] transition-colors">
            受賞歴へ →
          </Link>
        </div>
      </Section>

      {/* ── Story ────────────────────────────────────────────── */}
      <Section en="Story" ja="これまでの歩み" bg="cream">
        {/* スマホでは横スクロール（snap で1枚ずつ止まる）、lg 以上では5列に並べる。
            -mx/px で左右の余白ぶんまでスクロール領域を広げ、カードが画面端で切れて「続きがある」と見せる */}
        <div className={`relative flex lg:grid lg:grid-cols-5 gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 pb-4`}>
          {/* 年表をつなぐ線（lg 以上のみ）。各カードの丸の中心を通る高さに置いている */}
          <div aria-hidden="true" className="hidden lg:block absolute top-[7px] left-2 right-2 h-0.5 bg-[var(--onmouseorange)]" />
          {story.map((step) => (
            <div key={step.title} className="relative snap-start shrink-0 w-64 lg:w-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="size-4 rounded-full bg-[var(--ogangetext)] ring-4 ring-[var(--enableorange)]" />
                <span className="text-sm font-bold text-[var(--ogangetext)]">{step.period}</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <ImageSlot alt={step.title} hint={step.imageHint} className="w-full aspect-[4/3]" />
                <div className="p-4">
                  <p className="text-base font-bold text-black">{step.title}</p>
                  <p className="text-xs text-[var(--lighttext)] leading-5 mt-1.5">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* プロフィールは表ではなくチップで見せる */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-bold text-white bg-[var(--ogangetext)] rounded-full px-3.5 py-1.5">ISTP（巨匠）</span>
            {hobbies.map((hobby) => (
              <span key={hobby} className="text-sm text-black bg-white rounded-full px-3.5 py-1.5 shadow-sm">
                {hobby}
              </span>
            ))}
          </div>
          <Link href="/career" className="sm:ml-auto shrink-0 text-sm font-bold text-[var(--ogangetext)] hover:underline">
            くわしい経歴を読む →
          </Link>
        </div>
      </Section>

      {/* ── Character ────────────────────────────────────────── */}
      <Section en="Character" ja="大切にしていること">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {traits.map((trait, i) => (
            // relative は透かし番号（Watermark）の位置の基準にするため
            <div
              key={trait.title}
              className={`relative bg-white rounded-3xl p-6 overflow-hidden border border-[var(--softborder)] flex flex-col gap-3 ${CARD_SHADOW}`}
            >
              <Watermark index={i} />
              {/* 透かしより手前に出すため、中身にはすべて relative を付ける */}
              <span aria-hidden="true" className="relative block w-8 h-1 rounded-full bg-[var(--ogangetext)]" />
              <h3 className="relative text-lg font-bold text-black pr-16">{trait.title}</h3>
              <p className="relative text-sm text-[var(--lighttext)] leading-6">{trait.catchcopy}</p>
              <div className={`relative ${CARD_FOOTER}`}>
                <MoreDetails
                  title={trait.title}
                  header={<p className="text-sm text-[var(--lighttext)] leading-6">{trait.catchcopy}</p>}
                >
                  <p className="text-sm text-black leading-7">{trait.body}</p>
                </MoreDetails>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Skills ───────────────────────────────────────────── */}
      <Section en="Skills" ja="使える技術" bg="cream">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {skillGroups.map((group) => (
            <div key={group.category} className="bg-white rounded-3xl p-6 shadow-sm">
              {/* 見出しの左にオレンジの短い縦線を置き、アイコンなしでも区切りがわかるようにする */}
              <h3 className="text-base font-bold text-black mb-4 border-l-4 border-[var(--ogangetext)] pl-3 leading-tight">
                {group.category}
              </h3>
              {/* ロゴを主役にしたタイル状の並び。名前は小さく添える */}
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-[var(--cream)] px-1 py-3 text-center"
                  >
                    {item.icon ? (
                      <TechLogo icon={item.icon} name="" size={24} />
                    ) : (
                      // ロゴがない技術は頭文字を丸に入れて、ロゴと同じ大きさで揃える
                      <span aria-hidden="true" className="flex items-center justify-center size-6 rounded-full bg-[var(--onmouseorange)] text-[11px] font-bold text-[var(--ogangetext)]">
                        {item.name.charAt(0)}
                      </span>
                    )}
                    <span className="text-[11px] text-black leading-4 text-balance">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Now ──────────────────────────────────────────────── */}
      <Section en="Now" ja="いま取り組んでいること">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {nowItems.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--softborder)] p-6">
              <span className="inline-block text-xs font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-3 py-1">
                {item.label}
              </span>
              <p className="text-base font-bold text-black mt-4 leading-snug">{item.headline}</p>
              <p className="text-xs text-[var(--lighttext)] leading-5 mt-2">{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Links ────────────────────────────────────────────── */}
      {/* 最後はオレンジの帯で締める。ページの終わりがはっきりして、SNS へ誘導しやすい */}
      <section className={`bg-gradient-to-br from-[var(--ogangetext)] to-[var(--clickingorange)] ${PX} py-16 sm:py-20 text-center`}>
        <p className="text-sm font-bold text-white/80 tracking-wider">Links</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">気軽につながってください！</h2>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-black bg-white rounded-full px-5 py-3 shadow-md transition-shadow hover:shadow-lg"
            >
              <TechLogo icon={link.icon} name="" size={18} />
              {link.label}
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
