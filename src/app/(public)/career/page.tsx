import type { ReactNode } from 'react';

type TimelineItem = {
  period: string;
  title: string;
  subtitle?: string;
  items: string[];
};

const education: TimelineItem[] = [
  {
    period: "2018 〜 2021",
    title: "中学時代",
    items: [
      "YouTuberのガジェット動画をきっかけに、ガジェットや家電に興味を持ちました。ラムダ技術部に憧れて、電子工作やプログラミングをやってみたいと思うようになりました",
      "高校入学の直前、中学時代のプレゼントをすべてあきらめる代わりに13万円分のパーツを買い、初めてのPCを自作しました",
      "電子工作をちゃんと学びたくて、工業高校に進むことにしました",
    ],
  },
  {
    period: "2021.04 〜 2024.03",
    title: "岐阜県立岐阜工業高等学校 電子工学科",
    subtitle: "専門科目の評定は全科目 5 / 5",
    items: [
      "電気回路・電子回路・通信技術・PLCプログラミング・組み込み・LAN構築などを学びました",
      "実習では JW_CAD での回路図作成、TINA-TI での回路シミュレーション、基板設計を経験しました",
      "授業で初めてプログラミングに触れ、アルゴリズムや数学の手法を C で書いて練習していました",
      "課題研究では、Raspberry Pi と NFC を使った教員の入退室管理システムを作り、開発リーダーを務めました",
      "専門科目が得意で、クラスでは専門科目のことでよく質問を受けていました",
      "在学中に、国家資格を含む 15 の資格を取得しました",
      "ジュニアマイスター顕彰 経済産業大臣賞を受賞しました（270pt・歴代最高得点）",
      "生徒会役員を4期続けて務め、高3では生徒会長として業務のデジタル化やマニュアル化に取り組みました",
      "第48回全国高等学校総合文化祭（清流の国ぎふ総文2024）で広報イベント委員長を務めました",
    ],
  },
  {
    period: "2024.04 〜",
    title: "愛知工業大学 工学部 電気学科 電子情報工学専攻",
    subtitle: "GPA 3.5 / 4（1〜2年次）・専門科目はほぼ「秀」",
    items: [
      "電気回路（ラプラス変換・三相交流）、アナログ回路（オペアンプ・発振回路）、ディジタル回路（VHDL・FPGA）などを学びました",
      "組み込みシステム（割り込み・PWM制御）、電気磁気学、数値計算、フーリエ/ラプラス解析なども学んでいます",
      "授業の課題はAIを使わず、自分で理解しながら解くようにしています",
      "システム工学研究会（部員270名）に所属し、チーム開発やハッカソンに参加しています",
      "大学2年では Raspberry Pi Zero と Python で Wii リモコンの再現に挑戦し、BLE 通信を実装しました",
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
    period: "2021.10 〜 2023.09（4期連続）",
    tags: ["生徒会", "業務改善", "マニュアル作成"],
    body: [
      "生徒議会や委員会がうまく機能していないと感じ、1年の後期に役員に立候補しました。会長になる前に会計と書記を経験し、実際の業務を知ってから改革に取り組みました。",
      "紙の意見箱をWebフォーム（記名・匿名どちらも可）に切り替えたり、古いPCに頼っていた作業環境をNASでデジタル化したりしました。ほかにも、実現できない公約での当選を防ぐルール改定、全業務のマニュアル化と引き継ぎの整理、13名の新入役員を3グループに分けた運営などを行いました。",
      "放送の操作ミスをしてしまったことがあり、「わかっているつもり」が原因だったと反省して、すべての業務に手順書を作りました。",
      "顧問の先生から「自分でやれば解決する、という考え方だと仕事が一人に集中してしまう」と指摘を受け、仕事の分担や任せ方を見直しました。",
      "高校の志望者が減っていることが気になり、各学科の在校生インタビューを企画しました。9本の学科紹介記事を作り、中学校に配布しました。",
      "2000名以上が参列する卒業式で、在校生代表として送辞を述べました。",
    ],
  },
  {
    title: "第48回全国高等学校総合文化祭 広報イベント委員長",
    period: "2022.07 〜 2023.09（清流の国ぎふ総文2024）",
    tags: ["イベント企画", "広報", "チーム運営"],
    body: [
      "生徒実行委員の選考（倍率3倍）では、グループワークでみんなの意見の共通点をまとめてプレゼンを担当し、その点を評価してもらって選ばれました。",
      "広報イベント委員会では、PRイベントの構成とSNS運用、大会PRグッズ（幟・横断幕・ポスターなど）のデザインを担当しました。",
      "PRイベントは、誰に向けたものかを考えて内容を決めました。小中学生の親子にはワークショップ、幅広い年齢層には伝統文化を披露するステージ、というように形式を変えました。",
      "チームでは、全員から意見を聞くこと、安易に多数決で決めないこと、話が止まったら自分から案を出すことを心がけていました。大きな意見の対立はほとんどありませんでした。",
      "県庁・教育委員会への成果報告や、新聞・テレビなどのメディア出演も経験しました。",
      "東京総文（二県交流会）やかごしま総文（三県交流会・郡上踊披露）にも参加しました。生徒会長の任期と重なっていましたが、最後まで両方やり切りました。",
    ],
  },
  {
    title: "システム工学研究会（サークル）",
    period: "2024年4月〜（部員270名）",
    tags: ["Web開発", "勉強会", "ハッカソン"],
    body: [
      "情報系・技術系のサークルです。部室は毎日開いていて、技術の相談やチーム開発、ハッカソンへの参加などをしています。",
      "電子系に詳しい部員がほとんどいないので、ハードが必要なプロダクトではハードウェアの設計・実装を担当することが多いです。",
      "2025年10月の工科展では、Raspberry Pi・FastAPI・MariaDB・Next.js で、カメラを使った部室の入退室管理システムを作って出展しました。",
      "HTML・CSS（動画の講義資料も作りました）、競技プログラミング、電気回路（大学の授業のコツ）の勉強会を開きました。毎回10名以上が参加してくれました。",
      "資格を取ってきた経験から、「新卒エンジニアに資格は必要か」といった話を部員向けに発信しています。",
    ],
  },
  {
    title: "MatsuribaTech / 技育プロジェクト参加",
    period: "2024年〜",
    tags: ["コミュニティ", "登壇", "ハッカソン"],
    body: [
      "MatsuribaTech（東海エンジニア学生コミュニティ）には、2ヶ月に1回の開催にほぼ毎回参加しています。2025年5月に LT 登壇し、2025年6月の 28Tech vol.2（名駅 JR ゲートタワー）でも自己紹介 LT をしました。",
      "技育CAMPハッカソン（2回参加・優秀賞・最優秀賞）、技育CAMPキャラバン名古屋（2回参加）、技育博（ゆめみ企業賞）、技育CAMPアカデミア（定期参加）に参加しています。",
    ],
  },
  {
    title: "高校時代：青春18きっぷ一人旅",
    period: "高1〜高3（毎年夏）",
    tags: ["旅行", "青春18きっぷ"],
    body: [
      "セブンイレブンのアルバイト代で、毎年夏に青春18きっぷで一人旅をしていました。JRの時刻表と路線図を買って、ルートや乗り継ぎ、宿、観光地を自分で調べて計画しました。",
      "宮城（仙台・松島）、栃木（日光）、静岡・三重・和歌山・京都・大阪・兵庫・広島・香川などを訪れました。",
      "松島へ行ったときは、朝5時に出発して夜10時に着く、約17時間の移動でした。",
    ],
  },
];

const work: TimelineItem[] = [
  {
    period: "2021.12 〜 2024.03",
    title: "セブン‐イレブン・ジャパン（アルバイト）",
    items: [
      "約1年で1,000時間ほど勤務し、学生スタッフのまとめ役のような立場で働いていました",
      "キャンペーン商品や出来たて商品を、お客さんに積極的におすすめしていました",
      "自分のシフトの日はキャンペーン商品がよく売れていて、それがやりがいになっていました",
      "最終的には発注業務も任せてもらえるようになりました",
    ],
  },
  {
    period: "2024.08",
    title: "日立ソリューションズ・テクノロジー（インターン）",
    subtitle: "組込ソリューション本部 / 2週間 / C言語・組み込み",
    items: [
      "ドライブレコーダーの撮影画像をバイナリから取り出し、画像形式を判別して指定の形式に変換するプログラムをC言語で書きました",
      "組み込み環境ならではの制約や、デバッグを効率よく進める方法を学びました",
    ],
  },
  {
    period: "2024.06 〜",
    title: "愛知工業大学 エクステンションセンター（地域連携スタッフ）",
    items: [
      "小中学生向けイベント「まるごと体験ワールド」の運営や、イオンなどでの出張講義のお手伝いをしています",
      "2026年8月には、自分で企画した講座「コンピューターに『1+1＝10』って言わせてみよう！」を開きました。2進数と論理ゲートを説明したあと、半加算器・全加算器をブレッドボードで組み立てて、電気で計算ができることを体験してもらいました",
      "講座の教材として、23ビット加算器表示器（半加算器・全加算器の回路。7セグメントLEDで最大 2^23-1 の加算結果を表示）を自作しました",
    ],
  },
  {
    period: "2025.05 〜 2026.02",
    title: "愛知工業大学 ピアサポート（サポーター）",
    items: [
      "専門科目で困っている学生が、先輩に気軽に質問できる学習支援をしていました",
      "解き方をそのまま教えるのではなく、本人がコツをつかめるように一緒に考えることを意識していました",
      "利用者が少なかったので、友人に話を聞いて利用しにくい理由を探り、運営の改善を提案しました",
    ],
  },
  {
    period: "2026.04 〜",
    title: "コムスクエア（インターン）",
    subtitle: "フルリモート / Web エンジニア",
    items: ["Web エンジニアとして働いています"],
  },
  {
    period: "2026.04 〜 2026.09",
    title: "各社インターンシップ",
    subtitle: "就業型・短期インターンに計 9 社参加",
    items: [
      "ジーニー（2026年4月・2日間）",
      "GA technologies / オープンハウスグループ（2026年6月）",
      "SmartHR（5日間）・PLAY（3日間）・レバレジーズ（3日間）・クイック（3日間）（2026年8月）",
      "kubell（10日間）・ディップ（5日間・就業型）（2026年9月）",
    ],
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
          <div className="pb-7 flex-1 min-w-0">
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
      className={`${bg === "gray" ? "bg-[var(--page-bg)]" : "bg-white"} px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-11 sm:py-13 lg:py-16 xl:py-19${last ? "" : " border-b border-[var(--border)]"}`}
    >
      <div className="lg:grid lg:grid-cols-[160px_1fr] lg:gap-10 xl:grid-cols-[200px_1fr] xl:gap-16 2xl:grid-cols-[240px_1fr] 2xl:gap-20">
        <div className="mb-5 lg:mb-0 shrink-0">
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
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-8 sm:py-11">
        <p className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">Background</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">経歴</h1>
      </div>

      {/* Education */}
      <Section heading="Education">
        <Timeline items={education} />
      </Section>

      {/* Activities */}
      <Section heading="Activities" bg="gray">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
          {activities.map((act) => (
            <div key={act.title} className="bg-white rounded-xl p-5 xl:p-6">
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
      <Section heading="Work / Internship" last>
        <Timeline items={work} />
      </Section>

    </div>
  );
}
