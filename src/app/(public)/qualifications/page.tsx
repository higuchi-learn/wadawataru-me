import ImageSlot from '@/components/ImageSlot';
import { PageHero, Section } from '@/components/PageSection';

// 賞状や表彰式の写真を用意したら public/ 以下のパスを書く
const awardImage: string | undefined = '/images/meti-award.webp';

type Cert = {
  name: string;
  date: string;
  note?: string;
};

const itCerts: Cert[] = [
  {
    name: '情報処理安全確保支援士試験',
    date: '2023年6月',
    note: '国家資格。IPA の試験の中でも難易度が高い区分で、高校3年のときに合格しました。',
  },
  { name: '応用情報技術者試験', date: '2022年12月', note: '国家資格' },
  { name: '基本情報技術者試験', date: '2022年6月', note: '国家資格' },
  { name: '情報セキュリティマネジメント試験', date: '2023年6月', note: '国家資格' },
];

const electricCerts: Cert[] = [
  {
    name: '電気通信主任技術者（伝送交換）',
    date: '2023年8月',
    note: '国家資格・電気通信回線設備の監督者資格',
  },
  {
    name: '第一級陸上無線技術士',
    date: '2023年10月',
    note: '国家資格。陸上無線技術士の中で最上位の資格です。',
  },
  { name: '工事担任者 総合通信', date: '2023年12月', note: '国家資格・最上位区分' },
  { name: '第二種電気工事士', date: '2022年7月', note: '国家資格' },
  { name: '消防設備士 甲種4類', date: '2023年11月', note: '国家資格' },
  { name: '危険物取扱者 乙種4類', date: '2021年12月', note: '国家資格' },
];

const otherCerts: Cert[] = [
  { name: '電子機器組立て技能士 3級', date: '2022年3月' },
  { name: 'パソコン利用技術検定 2級', date: '2023年1月' },
  { name: '情報技術検定 1級', date: '2023年2月' },
  { name: '計算技術検定 1級', date: '2023年12月' },
  { name: 'リスニング英語検定 1級', date: '2021年10月' },
];

// 制度の基準点と自分の得点を同じ物差しの横棒で並べる。表で読むより「どれだけ上か」が一目でわかる
const MAX_POINTS = 270;
const pointBars = [
  { label: 'ブロンズ', points: 20, note: '20点以上' },
  { label: 'シルバー', points: 30, note: '30点以上' },
  { label: 'ゴールド', points: 45, note: '45点以上' },
  { label: 'わたしの得点', points: 270, note: '270pt・歴代最高', highlight: true },
];

// 資格1つ分のタイル
function CertTile({ cert }: { cert: Cert }) {
  // note の先頭が「国家資格」ならバッジとして切り出し、残りを補足として表示する
  const isNational = cert.note?.startsWith('国家資格') ?? false;
  // ^ は先頭、[。・]? は区切りの記号が1つあってもなくてもよい、という正規表現
  const rest = cert.note?.replace(/^国家資格[。・]?/, '') ?? '';
  return (
    <div className="bg-white rounded-2xl border border-[var(--softborder)] p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isNational && (
          <span className="text-[11px] font-bold text-white bg-[var(--ogangetext)] rounded-full px-2.5 py-0.5">
            国家資格
          </span>
        )}
        <span className="text-xs text-[var(--lighttext)]">{cert.date}</span>
      </div>
      <p className="text-base font-bold text-black leading-snug">{cert.name}</p>
      {rest && <p className="text-xs text-[var(--lighttext)] leading-5">{rest}</p>}
    </div>
  );
}

function CertGroup({ title, certs }: { title: string; certs: Cert[] }) {
  return (
    <div>
      {/* 見出しの左にオレンジの短い縦線を置き、グループの区切りをはっきりさせる */}
      <h3 className="text-lg font-bold text-black border-l-4 border-[var(--ogangetext)] pl-3 leading-tight mb-5">
        {title}
        <span className="text-sm font-normal text-[var(--lighttext)] ml-2">{certs.length}件</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((cert) => (
          <CertTile key={cert.name} cert={cert} />
        ))}
      </div>
    </div>
  );
}

const notes = [
  {
    label: 'セキュリティ',
    body: '情報処理安全確保支援士と情報セキュリティマネジメントを取得していて、Webセキュリティやインシデント対応、リスク管理について一通り学んでいます。',
  },
  {
    label: 'ハードウェア',
    body: '電気通信主任技術者・第一級陸上無線技術士・工事担任者・第二種電気工事士などを取得しており、ソフトウェアだけでなく電気・通信の分野も学んできました。',
  },
  {
    label: '取得時期',
    body: '15の資格は、すべて高校在学中に取得しました。',
  },
];

export default function QualificationsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageHero
        en="Certifications"
        ja="資格"
        lead="IT・セキュリティから電気・通信まで、15の資格をすべて高校在学中に取得しました。"
      />

      {/* ジュニアマイスター顕彰ハイライト */}
      <Section en="Special Award" ja="ジュニアマイスター顕彰 経済産業大臣賞">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start">
          <ImageSlot
            src={awardImage}
            alt="ジュニアマイスター顕彰 経済産業大臣賞"
            hint="表彰式や賞状の写真（4:3）"
            className="w-full aspect-[4/3] rounded-3xl"
          />

          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '270pt', label: '獲得点数', note: '歴代最高得点' },
                { value: '15', label: '取得資格数', note: 'すべて高校在学中' },
                { value: '全国1名', label: '受賞者数', note: '各年度の最高得点者' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[var(--enableorange)] rounded-2xl flex flex-col items-center justify-center px-2 py-5 text-center"
                >
                  {/* 数値は途中で折り返さないよう nowrap */}
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--ogangetext)] whitespace-nowrap leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-black font-bold mt-3">{stat.label}</p>
                  <p className="text-[11px] text-[var(--lighttext)] mt-0.5 text-balance">{stat.note}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-bold text-black mb-4">基準点との比較</p>
              <div className="space-y-3">
                {pointBars.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                    <span className={`text-xs ${bar.highlight ? 'font-bold text-[var(--ogangetext)]' : 'text-black'}`}>
                      {bar.label}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      {/* 幅を 270pt を 100% とした割合で決める。小さい値でも見えるよう最低幅を付けている */}
                      <div
                        className={`h-3 rounded-full min-w-3 ${bar.highlight ? 'bg-gradient-to-r from-[var(--clickingorange)] to-[var(--ogangetext)]' : 'bg-[var(--onmouseorange)]'}`}
                        style={{ width: `${(bar.points / MAX_POINTS) * 100}%` }}
                      />
                      <span
                        className={`text-xs whitespace-nowrap ${bar.highlight ? 'font-bold text-[var(--ogangetext)]' : 'text-[var(--lighttext)]'}`}
                      >
                        {bar.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--lighttext)] mt-3">
                経済産業大臣賞は、各年度の全国最高得点者1名のみに贈られます。
              </p>
            </div>

            <p className="text-sm text-black leading-7">
              高校1年の入学直後から、この制度でいちばん上の賞である経済産業大臣賞を目標に資格の勉強を始めました。
              高校3年では歴代最高得点の更新を目標にし、最終的に 270pt を取ることができました。
            </p>

            {/* 受賞歴ページのカードからこのページに飛んでくるので、受賞歴に書いていた学びもここに置く */}
            <div className="bg-[var(--enableorange)] rounded-2xl p-5">
              <p className="text-xs font-bold text-[var(--ogangetext)] mb-2">学び・気づき</p>
              <p className="text-sm text-black leading-7">
                資格の数を増やすこと自体が目的だったわけではなく、先に目標を決めて、そこから逆算して勉強の計画を立てていました。
                3年間続けられたのは、目標がはっきりしていたからだと思います。
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section en="Certifications" ja="取得した資格" bg="cream">
        <div className="space-y-12">
          <CertGroup title="IT・情報処理系" certs={itCerts} />
          <CertGroup title="電気・通信系" certs={electricCerts} />
          <CertGroup title="技能・その他" certs={otherCerts} />
        </div>
      </Section>

      <Section en="Note" ja="資格から見えること">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {notes.map((note, i) => (
            <div key={note.label} className="bg-[var(--cream)] rounded-3xl p-6">
              <p className="text-3xl font-bold text-[var(--clickingorange)] leading-none">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-lg font-bold text-black mt-4">{note.label}</h3>
              <p className="text-sm text-[var(--lighttext)] leading-7 mt-2">{note.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
