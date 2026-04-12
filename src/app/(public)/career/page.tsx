import type { ReactNode } from 'react';

type TimelineItem = {
  period: string;
  title: string;
  subtitle?: string;
  items: string[];
};

const education: TimelineItem[] = [
  {
    period: "〜 2021",
    title: "中学時代",
    items: [
      "YouTubeのガジェット動画に触発され、電子工作・プログラミングを独学で始める",
      "高校入学直前に中学時代のプレゼントをすべて放棄し、13万円分のパーツで人生初の自作PCを組み上げる",
      "工業高校への進学を自ら決断——「電子工作を本格的に学びたい」という動機から",
    ],
  },
  {
    period: "2021 〜 2024",
    title: "岐阜工業高等学校 電子工学科",
    items: [
      "電気回路・電子回路・通信技術・PLCプログラミング・組み込み・LAN構築を体系的に習得",
      "専門科目全般が得意で、クラスで「専門科目のことは樋口に聞けばいい」という雰囲気があった",
      "在学中に国家資格を含む 15 資格を取得",
      "ジュニアマイスター顕彰 経済産業大臣賞 受賞（270pt・歴代最高得点）",
      "生徒会長（高3）：4期連続で役員を務め、組織改革・デジタル化・マニュアル化を主導",
      "第48回全国高等学校総合文化祭（清流の国ぎふ総文2024）広報イベント委員長",
    ],
  },
  {
    period: "2024 〜",
    title: "愛知工業大学 工学部 電気学科 電子情報工学専攻",
    subtitle: "GPA 3.45（専門科目はほぼ「秀」、全27科目で「可」以下なし）",
    items: [
      "電気回路（ラプラス変換・三相交流）・アナログ回路（オペアンプ・発振回路）・ディジタル回路（VHDL・FPGA）を習得",
      "組み込みシステム（割り込み・PWM制御）・電気磁気学・数値計算・フーリエ/ラプラス解析を横断的に学習",
      "大学講義にAIを使わず自力で理解することを徹底。「なんとなく理解」では止まらない姿勢がGPA 3.45の背景",
      "システム工学研究会（部員270名）に所属。サークル内でのチーム開発・ハッカソンで複数受賞",
    ],
  },
];

const activities: {
  title: string;
  period: string;
  tags: string[];
  body: string[];
}[] = [
  {
    title: "生徒会長",
    period: "高1〜高3（4期連続）",
    tags: ["組織改革", "マネジメント", "仕組み設計"],
    body: [
      "生徒議会・委員会の機能不全を問題と捉え、1年後期に役員へ立候補。会長就任前に意図的に会計・書記の両役職を経験し、現場の課題を自分の体験として把握してから改革に臨んだ。",
      "【実施した改革】物理の意見箱 → Webフォームへ切り替え（記名・匿名両対応）／古いPCに縛られた作業環境をNAS活用でデジタル化／実現不可能な公約による当選を禁止するルール改定／全業務のマニュアル化・引き継ぎの体系化／13名の新入役員を3グループ制で運営。",
      "放送の誤操作トラブルから「わかっているはず」という慢心を自認し、全業務に手順書を整備する「フールプルーフ設計」を徹底するきっかけになった。",
      "「自分がやれば解決する」という思考が組織の属人化を招くという顧問の指摘を受け入れ、業務の分散・権限委譲のあり方を構造から見直した。",
      "高校の志望者減少という問題を自発的に発見し、各学科の在校生インタビューを企画・主導。9本の学科紹介記事を制作・中学校へ配布した。",
      "2000名以上が参列する卒業式で、在校生代表として送辞を述べた。",
    ],
  },
  {
    title: "第48回全国高等学校総合文化祭 広報イベント委員長",
    period: "高1〜高3（清流の国ぎふ総文2024）",
    tags: ["ファシリテーション", "広報設計", "チームマネジメント"],
    body: [
      "生徒実行委員会の選考（倍率3倍）では、グループワークで各意見の共通点を抽出して方針を整理しプレゼン担当を自ら担い、「グループでリーダーシップを持って動ける点」を評価されて当選。",
      "広報イベント委員会では①PRイベント全体の構成・SNS運用②大会PRグッズのデザイン制作（幟・横断幕・広告ポスターを含む）の2軸を担当。",
      "チーム運営では「必ず全員から意見を引き出す」「安易な多数決を使わない」「停滞したら自分が新しいアイデアを投下する」を一貫して実践。意見の対立をほぼゼロに抑えた。",
      "県庁・教育委員会への成果報告、新聞・テレビ等のメディア出演も経験。",
      "東京総文（二県交流会）・かごしま総文（三県交流会・郡上踊披露）にも参加。生徒会長との任期重複を両立し、最後までやり遂げた。",
    ],
  },
  {
    title: "システム工学研究会（サークル）",
    period: "2024年4月〜（部員270名）",
    tags: ["Web開発", "勉強会主催", "ハッカソン"],
    body: [
      "情報系・技術系サークル。部室は毎日開放され、技術相談・チーム開発・ハッカソン参加を日常的に行う環境。",
      "電子系の知見を持つ部員がほぼいないため、ハードを必要とするプロダクト開発ではハードウェア設計・実装を担当。",
      "勉強会を自発的に主催：「HTML・CSS（動画講義資料も制作）」「競技プログラミング」「電気回路（大学講義の習得コツ伝授）」——各回10名以上が参加。",
      "資格取得経験を活かした情報発信（「新卒エンジニアに資格は必要か」など一般的に語られにくい観点で部員向けに発信）。",
    ],
  },
  {
    title: "MatsuribaTech / 技育プロジェクト参加",
    period: "2024年〜",
    tags: ["コミュニティ", "登壇", "ハッカソン"],
    body: [
      "MatsuribaTech（東海エンジニア学生コミュニティ）に2ヶ月に1回ほぼ毎回参加。28Tech にて HTML・CSS 勉強会・競プロ勉強会の登壇実績あり。",
      "技育CAMPハッカソン（2回参加・優秀賞・最優秀賞）、技育CAMPキャラバン名古屋（2回参加）、技育博（ゆめみ企業賞）、技育CAMPアカデミア（定期参加）。",
    ],
  },
  {
    title: "高校時代：青春18きっぷ一人旅",
    period: "高1〜高3（毎年夏）",
    tags: ["自走力", "計画力", "行動力"],
    body: [
      "アルバイト代（セブンイレブン）を元手に、JRの時刻表・路線図を自ら購入してルート・所要時間・宿泊地・観光スポットを徹底的に調査・計画し毎年実行。",
      "訪問地：宮城（仙台・松島）、栃木（日光）、静岡・三重・和歌山・京都・大阪・兵庫・広島・香川など。",
      "松島への旅では朝5時出発・夜10時到着の約17時間移動を一人で完遂。すべてを自己完結で計画・実行する自立心を養った。",
    ],
  },
];

const work: TimelineItem[] = [
  {
    period: "高校在学中",
    title: "セブンイレブン（アルバイト）",
    items: [
      "約1年間で1,000時間近く勤務",
      "キャンペーン商品・出来たて商品の積極的な案内など、店舗利益につながる接客を実践",
      "自分のシフト日にキャンペーン商品の売れ行きが良くなるという結果が出ており、それをモチベーションに主体的に取り組んだ",
      "信頼の積み重ねにより、最終的に発注業務を任されるようになった",
    ],
  },
  {
    period: "2024年8月",
    title: "日立ソリューションズ・テクノロジー（インターン）",
    subtitle: "2週間 / C言語・組み込み",
    items: [
      "ドライブレコーダー撮影画像をバイナリで抽出・画像形式を特定し指定形式へ変換するプログラムをC言語で実装",
      "組み込み環境での制約・デバッグを素早く終えるためのテクニックを実践的に習得",
    ],
  },
  {
    period: "大学在学中",
    title: "愛知工業大学 ピアサポート（サポーター）",
    items: [
      "専門科目で困った学生が先輩に気軽に質問できる学習支援の場を提供",
      "「解き方を一方的に教えるのではなく、コツをつかむプロセスを一緒に歩む」指導スタイルを徹底",
      "「利用者が集まらない」という課題に対し、友人への聞き込みで障壁を把握し、運営改善を自発的に提案",
    ],
  },
  {
    period: "大学在学中",
    title: "愛知工業大学 エクステンションセンター（地域連携スタッフ）",
    items: [
      "小中学生向けイベント「まるごと体験ワールド」の運営補助・イオン等での出張講義お手伝い",
      "2026年度に自企画講座を開催予定：ブレッドボードを使った電子工作体験 + 情報学への興味喚起",
      "教材として 23ビット加算器表示器（半加算器・全加算器の回路）を自作（→ 7セグメントLEDで最大 2^23-1 の加算結果を表示）",
    ],
  },
  {
    period: "2025年〜",
    title: "コムスクエア（インターン）",
    subtitle: "フルリモート / Web エンジニア",
    items: ["Web エンジニアとして業務に従事"],
  },
];

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-5 sm:gap-8">
          {/* 期間 */}
          <div className="w-24 sm:w-32 shrink-0 pt-1 text-right">
            <p className="text-xs text-[var(--lighttext)] leading-5">{item.period}</p>
          </div>
          {/* ドット + 縦線 */}
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--ogangetext)] mt-1 shrink-0" />
            {i < items.length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
          </div>
          {/* 内容 */}
          <div className="pb-10 flex-1 min-w-0">
            <h3 className="text-sm font-bold text-black leading-5">{item.title}</h3>
            {item.subtitle && (
              <p className="text-xs text-[var(--ogangetext)] mt-1 font-medium">{item.subtitle}</p>
            )}
            <ul className="mt-2 space-y-1.5">
              {item.items.map((line, j) => (
                <li key={j} className="text-sm text-black leading-6 flex gap-2">
                  <span className="shrink-0 text-[var(--ogangetext)]">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

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

export default function CareerPage() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ページタイトル */}
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <p className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">Background</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">経歴</h1>
      </div>

      {/* Education */}
      <Section heading="Education" bg="gray">
        <Timeline items={education} />
      </Section>

      {/* Activities */}
      <Section heading="Activities">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
          {activities.map((act) => (
            <div key={act.title} className="bg-[var(--page-bg)] rounded-xl p-5 xl:p-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <h3 className="text-sm font-bold text-black">{act.title}</h3>
                <p className="text-xs text-[var(--lighttext)] shrink-0">{act.period}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {act.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-2.5 py-0.5 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ul className="space-y-2">
                {act.body.map((line, i) => (
                  <li key={i} className="text-sm text-black leading-7 flex gap-2">
                    <span className="shrink-0 text-[var(--ogangetext)]">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Work / Internship */}
      <Section heading="Work / Internship" bg="gray" last>
        <Timeline items={work} />
      </Section>

    </div>
  );
}
