import type { Metadata } from 'next';
import ImageSlot from '@/components/ImageSlot';
import { CARD_SHADOW, CARD_FOOTER, PageHero, Section, Watermark } from '@/components/PageSection';
import MoreDetails from '@/components/MoreDetails';
import { pageMetadata } from '@/lib/siteMetadata';

// ページ上部の見出しと紹介文。ブラウザのタブや SNS のプレビューに出す題名・説明にも使う
const PAGE_TITLE = 'プロフィール';
const PAGE_LEAD =
  'どんな人なのかと、PC の自作から工業高校、大学、そして Web エンジニアのインターンまでの経歴をまとめています。';

export const metadata: Metadata = pageMetadata(PAGE_TITLE, PAGE_LEAD, '/career');

type TimelineItem = {
  period: string;
  title: string;
  subtitle?: string;
  // カードで最初に見せる一言。箇条書きの items は「くわしく」の中に入れる
  summary: string;
  items: string[];
  // 画像を用意したら public/ 以下のパスを書く
  image?: string;
  // 画像の枠を出したい項目だけ指定する。ImageSlot に表示する「何の画像を入れるか」
  imageHint?: string;
};

const education: TimelineItem[] = [
  {
    period: '2018 〜 2021',
    title: '中学時代',
    summary: '卓球に打ち込み、学級委員や生徒会にも進んで取り組んだ。',
    image: '/images/junior-high-2.webp',
    imageHint: '中学時代の写真（卓球・生徒会など）',
    items: [
      '卓球に打ち込んでいました。当時の趣味はフォートナイトでした。',
      '小学校のころから学級委員や生徒会に挑戦するのが好きで、中学でも進んで取り組んでいました。',
      'YouTuberのガジェット動画をきっかけに、ガジェットや家電に興味を持ちました。ラムダ技術部に憧れて、電子工作やプログラミングをやってみたいと思うようになりました。',
      '電子工作をちゃんと学びたくて岐阜高専を受験しましたが、英語の点数が低すぎて不合格でした。英語が平均点さえ取れていれば、合格ラインを超えていました。',
      '英語が苦手なのはわかっていたのに、克服しようとせずに避けていました。嫌なことから逃げていた結果が、そのまま失敗につながりました。',
      'その後、岐阜工業高校の電子工学科に進みました。この失敗があって、高校では手を抜かず、何事にも全力で取り組めるようになりました。',
    ],
  },
  {
    period: '2021.04 〜 2024.03',
    title: '岐阜県立岐阜工業高等学校 電子工学科',
    subtitle: '専門科目の評定は全科目 5 / 5',
    summary: '電気電子・通信を学び、15の資格と経済産業大臣賞。生徒会長も務めた。',
    image: '/images/high-school.webp',
    imageHint: '高校での実習や生徒会活動の写真',
    items: [
      '高校入学の直前、中学時代のプレゼントをすべてあきらめる代わりに13万円分のパーツを買い、初めてのPCを自作しました。',
      '電気回路・電子回路・通信技術・PLCプログラミング・組み込み・LAN構築などを学びました。',
      '実習では JW_CAD での回路図作成、TINA-TI での回路シミュレーション、基板設計を経験しました。',
      '授業で初めてプログラミングに触れ、アルゴリズムや数学の手法を C で書いて練習していました。',
      '課題研究では、Raspberry Pi と NFC を使った教員の入退室管理システムを作り、開発リーダーを務めました。',
      '専門科目が得意で、クラスでは専門科目のことでよく質問を受けていました。',
      '在学中に、国家資格を含む 15 の資格を取得しました。',
      'ジュニアマイスター顕彰 経済産業大臣賞を受賞しました（270pt・歴代最高得点）。',
      '生徒会役員を4期続けて務め、高3では生徒会長として業務のデジタル化やマニュアル化に取り組みました。',
      '第48回全国高等学校総合文化祭（清流の国ぎふ総文2024）で広報イベント委員長を務めました。',
    ],
  },
  {
    period: '2024.04 〜',
    title: '愛知工業大学 工学部 電気学科 電子情報工学専攻',
    subtitle: 'GPA 3.5 / 4（1〜2年次）・専門科目はほぼ「秀」',
    summary: '回路から組み込みまで学びつつ、サークルでチーム開発とハッカソンに参加。',
    image: '/images/university.webp',
    imageHint: '大学やサークルでの活動の写真',
    items: [
      '信州大学を受験しましたが不合格となり、愛知工業大学に進みました。',
      '電気回路（ラプラス変換・三相交流）、アナログ回路（オペアンプ・発振回路）、ディジタル回路（VHDL・FPGA）などを学びました。',
      '組み込みシステム（割り込み・PWM制御）、電気磁気学、数値計算、フーリエ/ラプラス解析なども学んでいます。',
      '授業の課題はAIを使わず、自分で理解しながら解くようにしています。',
      'システム工学研究会（部員270名）に所属し、チーム開発やハッカソンに参加しています。',
      '大学2年では Raspberry Pi Zero と Python で Wii リモコンの再現に挑戦し、BLE 通信を実装しました。',
    ],
  },
];

type Activity = {
  title: string;
  period: string;
  tags: string[];
  summary: string;
  body: string[];
  image?: string;
  imageHint: string;
};

const activities: Activity[] = [
  {
    title: '生徒会活動',
    period: '2021.10 〜 2023.09（4期連続）',
    summary: '4期連続で役員を務め、意見箱の Web 化や全業務のマニュアル化に取り組んだ。',
    image: '/images/student-council.webp',
    imageHint: '生徒会活動や卒業式の写真',
    tags: ['生徒会', '業務改善', 'マニュアル作成'],
    body: [
      '生徒議会や委員会がうまく機能していないと感じ、1年の後期に役員に立候補しました。会長になる前に会計と書記を経験し、実際の業務を知ってから改革に取り組みました。',
      '紙の意見箱をWebフォーム（記名・匿名どちらも可）に切り替えたり、古いPCに頼っていた作業環境をNASでデジタル化したりしました。ほかにも、実現できない公約での当選を防ぐルール改定、全業務のマニュアル化と引き継ぎの整理、13名の新入役員を3グループに分けた運営などを行いました。',
      '放送の操作ミスをしてしまったことがあり、「わかっているつもり」が原因だったと反省して、すべての業務に手順書を作りました。',
      '顧問の先生から「自分でやれば解決する、という考え方だと仕事が一人に集中してしまう」と指摘を受け、仕事の分担や任せ方を見直しました。',
      '高校の志望者が減っていることが気になり、各学科の在校生インタビューを企画しました。9本の学科紹介記事を作り、中学校に配布しました。',
      '2000名以上が参列する卒業式で、在校生代表として送辞を述べました。',
    ],
  },
  {
    title: '第48回全国高等学校総合文化祭 広報イベント委員長',
    period: '2022.07 〜 2023.09（清流の国ぎふ総文2024）',
    summary: 'PR イベントの企画・SNS 運用・グッズのデザインを担当し、委員会をまとめた。',
    image: '/images/soubun.webp',
    imageHint: 'PR イベントや大会グッズの写真',
    tags: ['イベント企画', '広報', 'チーム運営'],
    body: [
      '生徒実行委員の選考（倍率3倍）では、グループワークでみんなの意見の共通点をまとめてプレゼンを担当し、その点を評価してもらって選ばれました。',
      '広報イベント委員会では、PRイベントの構成とSNS運用、大会PRグッズ（幟・横断幕・ポスターなど）のデザインを担当しました。',
      'PRイベントは、誰に向けたものかを考えて内容を決めました。小中学生の親子にはワークショップ、幅広い年齢層には伝統文化を披露するステージ、というように形式を変えました。',
      'チームでは、全員から意見を聞くこと、安易に多数決で決めないこと、話が止まったら自分から案を出すことを心がけていました。大きな意見の対立はほとんどありませんでした。',
      '県庁・教育委員会への成果報告や、新聞・テレビなどのメディア出演も経験しました。',
      '東京総文（二県交流会）やかごしま総文（三県交流会・郡上踊披露）にも参加しました。生徒会長の任期と重なっていましたが、最後まで両方やり切りました。',
    ],
  },
  {
    title: 'システム工学研究会（サークル）',
    period: '2024年4月〜（部員270名）',
    summary: 'ハードウェア担当としてチーム開発に参加し、勉強会も開いている。',
    image: '/images/syskenkyu.webp',
    imageHint: '工科展の展示や勉強会の写真',
    tags: ['Web開発', '勉強会', 'ハッカソン'],
    body: [
      '情報系・技術系のサークルです。部室は毎日開いていて、技術の相談やチーム開発、ハッカソンへの参加などをしています。',
      '電子系に詳しい部員がほとんどいないので、ハードが必要なプロダクトではハードウェアの設計・実装を担当することが多いです。',
      '2025年10月の工科展では、Raspberry Pi・FastAPI・MariaDB・Next.js で、カメラを使った部室の入退室管理システムを作って出展しました。',
      'HTML・CSS（動画の講義資料も作りました）、競技プログラミング、電気回路（大学の授業のコツ）の勉強会を開きました。毎回10名以上が参加してくれました。',
      '資格を取ってきた経験から、「新卒エンジニアに資格は必要か」といった話を部員向けに発信しています。',
    ],
  },
  {
    title: 'MatsuribaTech / 技育プロジェクト参加',
    period: '2024年〜',
    summary: '東海の学生エンジニアコミュニティに通い、LT にも登壇。',
    image: '/images/geekten.webp',
    imageHint: 'LT 登壇やイベントの写真',
    tags: ['コミュニティ', '登壇', 'ハッカソン'],
    body: [
      'MatsuribaTech（東海エンジニア学生コミュニティ）には、2ヶ月に1回の開催にほぼ毎回参加しています。2025年5月に LT 登壇し、2025年6月の 28Tech vol.2（名駅 JR ゲートタワー）でも自己紹介 LT をしました。',
      '技育CAMPハッカソン（2回参加・優秀賞・最優秀賞）、技育CAMPキャラバン名古屋（2回参加）、技育博（ゆめみ企業賞）、技育CAMPアカデミア（定期参加）に参加しています。',
    ],
  },
  {
    title: '高校時代：青春18きっぷ一人旅',
    period: '高1〜高3（毎年夏）',
    summary: '時刻表と路線図を片手に、毎年夏に全国を一人旅。',
    image: '/images/seishun18-trip.webp',
    imageHint: '旅先で撮った写真',
    tags: ['旅行', '青春18きっぷ'],
    body: [
      'セブンイレブンのアルバイト代で、毎年夏に青春18きっぷで一人旅をしていました。JRの時刻表と路線図を買って、ルートや乗り継ぎ、宿、観光地を自分で調べて計画しました。',
      '宮城（仙台・松島）、栃木（日光）、静岡・三重・和歌山・京都・大阪・兵庫・広島・香川などを訪れました。',
      '松島へ行ったときは、朝5時に出発して夜10時に着く、約17時間の移動でした。',
    ],
  },
];

const work: TimelineItem[] = [
  {
    period: '2021.12 〜 2024.03',
    title: 'セブン‐イレブン・ジャパン（アルバイト）',
    summary: '約1年で1,000時間勤務し、発注業務も任せてもらえるようになった。',
    items: [
      '約1年で1,000時間ほど勤務し、学生スタッフのまとめ役のような立場で働いていました。',
      'キャンペーン商品や出来たて商品を、お客さんに積極的におすすめしていました。',
      '自分のシフトの日はキャンペーン商品がよく売れていて、それがやりがいになっていました。',
      '最終的には発注業務も任せてもらえるようになりました。',
    ],
  },
  {
    period: '2024.08',
    title: '日立ソリューションズ・テクノロジー（インターン）',
    subtitle: '組込ソリューション本部 / 2週間 / C言語・組み込み',
    summary: 'ドライブレコーダーの撮影画像を変換するプログラムを C 言語で開発。',
    items: [
      'ドライブレコーダーの撮影画像をバイナリから取り出し、画像形式を判別して指定の形式に変換するプログラムをC言語で書きました。',
      '組み込み環境ならではの制約や、デバッグを効率よく進める方法を学びました。',
    ],
  },
  {
    period: '2024.06 〜',
    title: '愛知工業大学 エクステンションセンター（地域連携スタッフ）',
    summary: '小中学生向けイベントを運営し、自分で企画した講座も開いた。',
    items: [
      '小中学生向けイベント「まるごと体験ワールド」の運営や、イオンなどでの出張講義のお手伝いをしています。',
      '2026年8月には、自分で企画した講座「コンピューターに『1+1＝10』って言わせてみよう！」を開きました。2進数と論理ゲートを説明したあと、半加算器・全加算器をブレッドボードで組み立てて、電気で計算ができることを体験してもらいました。',
      '講座の教材として、23ビット加算器表示器（半加算器・全加算器の回路。7セグメントLEDで最大 2^23-1 の加算結果を表示）を自作しました。',
    ],
  },
  {
    period: '2025.05 〜 2026.02',
    title: '愛知工業大学 ピアサポート（サポーター）',
    summary: '専門科目で困っている学生の学習を、一緒に考えながら支援。',
    items: [
      '専門科目で困っている学生が、先輩に気軽に質問できる学習支援をしていました。',
      '解き方をそのまま教えるのではなく、本人がコツをつかめるように一緒に考えることを意識していました。',
      '利用者が少なかったので、友人に話を聞いて利用しにくい理由を探り、運営の改善を提案しました。',
    ],
  },
  {
    period: '2026.04 〜',
    title: 'コムスクエア（インターン）',
    subtitle: 'フルリモート / Web エンジニア',
    summary: 'Web エンジニアとして働いています。',
    items: [],
  },
  {
    period: '2026.04 〜 2026.09',
    title: '各社インターンシップ',
    subtitle: '就業型・短期インターンに計 9 社参加',
    summary: 'SmartHR・kubell・ディップなど、計9社の就業型・短期インターンに参加。',
    items: [
      'ジーニー（2026年4月・2日間）',
      'GA technologies / オープンハウスグループ（2026年6月）',
      'SmartHR（5日間）・PLAY（3日間）・レバレジーズ（3日間）・クイック（3日間）（2026年8月）',
      'kubell（10日間）・ディップ（5日間・就業型）（2026年9月）',
    ],
  },
];

// 箇条書き。ポップアップの本文として使う
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((line, i) => (
        <li key={i} className="text-sm text-black leading-7 flex gap-2">
          {/* 行頭の小さな丸。テキストの1行目の中央に来るよう mt で調整 */}
          <span className="shrink-0 size-1.5 rounded-full bg-[var(--clickingorange)] mt-3" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

// 期間のピル。画像の上に重ねるときは白地（onImage）、それ以外は薄いオレンジ地
function PeriodPill({ period, onImage = false }: { period: string; onImage?: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-bold rounded-full px-3 py-1 ${
        onImage ? 'bg-white/95 text-[var(--ogangetext)] shadow-md' : 'bg-[var(--enableorange)] text-[var(--ogangetext)]'
      }`}
    >
      {period}
    </span>
  );
}

// ── 学歴 ──────────────────────────────────────────────

// 画像＋左下に期間。カードとポップアップの両方で同じものを表示する
function EducationMedia({ item }: { item: TimelineItem }) {
  if (!item.imageHint) return null;
  return (
    <div className="relative">
      <ImageSlot src={item.image} alt={item.title} hint={item.imageHint} className="w-full aspect-video" />
      <div className="absolute left-4 bottom-4">
        <PeriodPill period={item.period} onImage />
      </div>
    </div>
  );
}

// 補足（評定・GPA など）と一言要約。カードとポップアップの両方で同じものを表示する
function EducationSummary({ item }: { item: TimelineItem }) {
  return (
    <div className="flex flex-col gap-2">
      {item.subtitle && (
        <p className="self-start text-xs font-bold text-white bg-[var(--ogangetext)] rounded-full px-3 py-1">
          {item.subtitle}
        </p>
      )}
      <p className="text-sm text-[var(--lighttext)] leading-6">{item.summary}</p>
    </div>
  );
}

// 学歴は3段階なので、横に並べて「ステップを上っていく」ように見せる
function EducationSteps({ items }: { items: TimelineItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      {items.map((item, i) => (
        <article key={item.title} className={`bg-white rounded-3xl overflow-hidden flex flex-col ${CARD_SHADOW}`}>
          <EducationMedia item={item} />
          {/* relative は透かし番号（Watermark）の位置の基準にするため */}
          <div className="relative p-6 flex flex-col gap-3 flex-1">
            <Watermark index={i} />
            {/* 透かしより手前に出すため relative を付ける */}
            <p className="relative text-xs font-bold tracking-wider text-[var(--ogangetext)]">STEP {i + 1}</p>
            <h4 className="relative text-lg font-bold text-black leading-snug pr-16">{item.title}</h4>
            <div className="relative">
              <EducationSummary item={item} />
            </div>
            <div className={`relative ${CARD_FOOTER}`}>
              <MoreDetails
                title={item.title}
                media={<EducationMedia item={item} />}
                header={<EducationSummary item={item} />}
              >
                <BulletList items={item.items} />
              </MoreDetails>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ── 課外活動 ──────────────────────────────────────────

function ActivityMedia({ act }: { act: Activity }) {
  return (
    <div className="relative">
      <ImageSlot src={act.image} alt={act.title} hint={act.imageHint} className="w-full aspect-video" />
      <div className="absolute left-4 bottom-4 right-4">
        <PeriodPill period={act.period} onImage />
      </div>
    </div>
  );
}

function ActivitySummary({ act }: { act: Activity }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--lighttext)] leading-6">{act.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {act.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-black bg-[var(--cream)] border border-[var(--softborder)] rounded-full px-3 py-1"
          >
            # {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 仕事・インターン ──────────────────────────────────

function WorkMedia({ item }: { item: TimelineItem }) {
  if (!item.imageHint) return null;
  return <ImageSlot src={item.image} alt={item.title} hint={item.imageHint} className="w-full aspect-video" />;
}

function WorkSummary({ item, withPeriod = false }: { item: TimelineItem; withPeriod?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {/* ポップアップでは左の期間の列がないので、ここに期間を出す */}
      {withPeriod && (
        <div>
          <PeriodPill period={item.period} />
        </div>
      )}
      {item.subtitle && <p className="text-xs font-bold text-[var(--ogangetext)]">{item.subtitle}</p>}
      <p className="text-sm text-[var(--lighttext)] leading-6">{item.summary}</p>
    </div>
  );
}

// 職歴は件数が多いので縦の年表。左に期間、中央に線と丸、右にカードを置く
function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.title} className="flex gap-4 sm:gap-6">
          {/* 期間（sm 以上のみ。スマホではカード内に表示する） */}
          <div className="hidden sm:block w-36 shrink-0 pt-6 text-right">
            <p className="text-xs font-bold text-[var(--ogangetext)] leading-5">{item.period}</p>
          </div>
          {/* 丸 + 縦線。最後の項目では線を伸ばさない */}
          <div className="flex flex-col items-center">
            <span className="size-4 rounded-full bg-[var(--ogangetext)] ring-4 ring-[var(--enableorange)] mt-6 shrink-0" />
            {i < items.length - 1 && <span className="w-0.5 flex-1 bg-[var(--onmouseorange)] mt-1" />}
          </div>
          {/* カード。min-w-0 で長い文章があっても flex 子要素がはみ出さないようにする */}
          <div className="pb-6 flex-1 min-w-0">
            {/* 左端のオレンジの帯で、年表の丸とカードを視覚的につなぐ */}
            <article
              className={`bg-white rounded-3xl overflow-hidden border-l-4 border-[var(--ogangetext)] ${CARD_SHADOW}`}
            >
              <div className="sm:flex">
                <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col gap-2">
                  <p className="sm:hidden text-xs font-bold text-[var(--ogangetext)]">{item.period}</p>
                  <h4 className="text-base sm:text-lg font-bold text-black leading-snug">{item.title}</h4>
                  <WorkSummary item={item} />
                  {item.items.length > 0 && (
                    <div className={CARD_FOOTER}>
                      <MoreDetails
                        title={item.title}
                        media={<WorkMedia item={item} />}
                        header={<WorkSummary item={item} withPeriod />}
                      >
                        <BulletList items={item.items} />
                      </MoreDetails>
                    </div>
                  )}
                </div>
                {/* 画像はカードの右側に、上下いっぱいの高さで置く */}
                {item.imageHint && (
                  <ImageSlot
                    src={item.image}
                    alt={item.title}
                    hint={item.imageHint}
                    className="w-full sm:w-60 aspect-video sm:aspect-auto shrink-0"
                  />
                )}
              </div>
            </article>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 自己紹介 ──────────────────────────────────────────

const intro =
  '愛知工業大学で電子情報工学を学んでいる3年生です。工業高校の電子工学科で回路や組み込みを学び、大学ではサークルやハッカソンで Web アプリやデバイスを作っています。ハードとソフトの両方を、手を動かしてつくるのが好きです。';

// 基本情報。表ではなく「項目名＋値」の並びで見せる
const basics = [
  { label: '名前', value: '樋口 陽輝（わだわたる）' },
  { label: '所属', value: '愛知工業大学 工学部 電気学科 電子情報工学専攻 3年' },
  { label: '出身校', value: '岐阜県立岐阜工業高等学校 電子工学科' },
  { label: 'いまやっていること', value: 'コムスクエアで Web エンジニアのインターン' },
  { label: '目指しているもの', value: 'フルスタック × セキュリティのエンジニア' },
  { label: '性格タイプ', value: 'ISTP（巨匠）' },
];

// note は一言の補足。書いていない趣味は名前だけを表示する
const hobbies: { name: string; note?: string }[] = [
  { name: '料理' },
  { name: 'VALORANT' },
  { name: '旅行', note: '高校時代は毎年夏に、青春18きっぷで全国を一人旅していました。' },
  { name: '書道' },
  { name: '電子工作', note: 'ラムダ技術部に憧れて始め、ハッカソンでもハード担当です。' },
  { name: '資格取得', note: '高校在学中に、国家資格を含む15の資格を取りました。' },
];

// 「経歴」セクションの中の小見出し。セクション見出し（h2）より一段小さく見せる
function SubHeading({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6 sm:mb-8">
      <h3 className="text-xl sm:text-2xl font-bold text-black">{ja}</h3>
      <span className="text-xs font-bold text-[var(--ogangetext)] tracking-wider">{en}</span>
    </div>
  );
}

export default function CareerPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageHero en="Profile" ja={PAGE_TITLE} lead={PAGE_LEAD} />

      <Section en="About me" ja="自己紹介">
        <p className="text-base text-black leading-8 max-w-3xl">{intro}</p>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 mt-10 max-w-4xl">
          {basics.map((item) => (
            <div key={item.label} className="py-4 border-b border-[var(--softborder)]">
              <dt className="text-xs font-bold text-[var(--ogangetext)]">{item.label}</dt>
              <dd className="text-sm text-black leading-6 mt-1">{item.value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="text-xl font-bold text-black mt-14 mb-6">趣味</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hobbies.map((hobby) => (
            <div key={hobby.name} className="bg-[var(--cream)] rounded-2xl p-5">
              <p className="text-base font-bold text-black">{hobby.name}</p>
              {hobby.note && <p className="text-xs text-[var(--lighttext)] leading-5 mt-2">{hobby.note}</p>}
            </div>
          ))}
        </div>
      </Section>

      <Section en="Career" ja="経歴" bg="cream">
        <div className="flex flex-col gap-16 sm:gap-20">
          <div>
            <SubHeading en="Education" ja="学歴" />
            <EducationSteps items={education} />
          </div>

          <div>
            <SubHeading en="Activities" ja="課外活動" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {activities.map((act) => (
                <article
                  key={act.title}
                  className={`bg-white rounded-3xl overflow-hidden border border-[var(--softborder)] flex flex-col ${CARD_SHADOW}`}
                >
                  <ActivityMedia act={act} />
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <h4 className="text-lg font-bold text-black leading-snug">{act.title}</h4>
                    <ActivitySummary act={act} />
                    <div className={CARD_FOOTER}>
                      <MoreDetails
                        title={act.title}
                        media={<ActivityMedia act={act} />}
                        header={<ActivitySummary act={act} />}
                      >
                        <BulletList items={act.body} />
                      </MoreDetails>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <SubHeading en="Work / Internship" ja="仕事・インターン" />
            <Timeline items={work} />
          </div>
        </div>
      </Section>
    </div>
  );
}
