import type { ReactNode } from 'react';

type Cert = {
  name: string;
  date: string;
  note?: string;
};

const itCerts: Cert[] = [
  {
    name: "情報処理安全確保支援士試験",
    date: "2023年6月",
    note: "国家資格・IPA 最上位区分の一つ。現役エンジニアでも難しい試験を高校3年で取得。",
  },
  { name: "応用情報技術者試験", date: "2022年12月", note: "国家資格" },
  { name: "基本情報技術者試験", date: "2022年6月", note: "国家資格" },
  { name: "情報セキュリティマネジメント試験", date: "2023年6月", note: "国家資格" },
];

const electricCerts: Cert[] = [
  {
    name: "電気通信主任技術者（伝送交換）",
    date: "2023年8月",
    note: "国家資格・電気通信回線設備の監督者資格",
  },
  {
    name: "第一級陸上無線技術士",
    date: "2023年10月",
    note: "国家資格・無線技術士の最上位。放送局・通信会社の技術者が取る資格。",
  },
  { name: "工事担任者 総合通信", date: "2023年12月", note: "国家資格・最上位区分" },
  { name: "第二種電気工事士", date: "2022年7月", note: "国家資格" },
  { name: "消防設備士 甲種4類", date: "2023年11月", note: "国家資格" },
  { name: "危険物取扱者 乙種4類", date: "2021年12月", note: "国家資格" },
];

const otherCerts: Cert[] = [
  { name: "電子機器組立て技能士 3級", date: "2022年3月" },
  { name: "パソコン利用技術検定 2級", date: "2023年1月" },
  { name: "情報技術検定 1級", date: "2023年2月" },
  { name: "計算技術検定 1級", date: "2023年12月" },
  { name: "リスニング英語検定 1級", date: "2021年10月" },
];

function CertTable({ certs }: { certs: Cert[] }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {certs.map((cert) => (
        <div
          key={cert.name}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-4 gap-1 sm:gap-6"
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-black">{cert.name}</p>
            {cert.note && (
              <p className="text-xs text-[var(--lighttext)] leading-5">{cert.note}</p>
            )}
          </div>
          <p className="text-xs text-[var(--lighttext)] shrink-0 sm:pt-0.5">{cert.date}</p>
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

export default function QualificationsPage() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ページタイトル */}
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <p className="text-xs font-bold text-[var(--ogangetext)] mb-3 tracking-widest uppercase">Credentials</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">資格</h1>
      </div>

      {/* ジュニアマイスター顕彰ハイライト */}
      <Section heading="Special Award">
        <div className="bg-[var(--page-bg)] rounded-2xl overflow-hidden">
          {/* ヘッダ */}
          <div className="p-6 sm:p-8 border-b border-[var(--border)]">
            <p className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-2">
              最高位受賞
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-black leading-tight">
              ジュニアマイスター顕彰 経済産業大臣賞
            </h2>
            <p className="text-sm text-[var(--lighttext)] mt-1">
              公益社団法人全国工業高等学校長協会主催 令和5年度
            </p>
          </div>

          {/* 数値 */}
          <div className="grid grid-cols-3 gap-3 p-6 sm:p-8 bg-white">
            {[
              { value: "270 pt", label: "獲得点数", note: "歴代最高得点" },
              { value: "17", label: "取得試験数", note: "すべて高校在学中" },
              { value: "全国 1 名", label: "受賞者数", note: "各年度の最高得点者のみ" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--enableorange)] rounded-xl flex flex-col items-center justify-center py-6 px-3 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--ogangetext)]">{s.value}</p>
                <p className="text-xs text-black font-medium mt-1">{s.label}</p>
                <p className="text-xs text-[var(--lighttext)] mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>

          {/* 説明 */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 bg-white space-y-3">
            <p className="text-sm text-black leading-7">
              高校1年の入学直後から、この制度の最高位である「経済産業大臣賞」を目標として資格取得を開始。
              高校3年になると目標を「歴代最高得点の更新」へ上書きし、最終的に歴代最高得点 270pt を達成した。
            </p>
            <p className="text-sm text-black leading-7">
              資格取得は「多く取ること」が目的ではなく、「目標から逆算して動く」という行動原理の実践結果。
              情報処理安全確保支援士・第一級陸上無線技術士など、難関国家資格を含む15資格を高校在学中にすべて取得した。
            </p>
          </div>

          {/* 制度概要テーブル */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 bg-white border-t border-[var(--border)] pt-6">
            <p className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-3">制度概要</p>
            <div className="rounded-xl overflow-hidden border border-[var(--border)]">
              {[
                { rank: "ブロンズ", pts: "20点以上", highlight: false },
                { rank: "シルバー", pts: "30点以上", highlight: false },
                { rank: "ゴールド", pts: "45点以上", highlight: false },
                { rank: "経済産業大臣賞", pts: "各年度・全国最高得点者のみ", highlight: true },
              ].map((row) => (
                <div
                  key={row.rank}
                  className={`flex items-center justify-between px-4 py-3 text-sm border-b border-[var(--border)] last:border-b-0 ${
                    row.highlight
                      ? "bg-[var(--ogangetext)] text-white font-bold"
                      : "text-black"
                  }`}
                >
                  <span>{row.rank}</span>
                  <span className="text-xs">{row.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* IT系 + 電気系 */}
      <Section heading="Certifications" bg="gray">
        <div className="xl:grid xl:grid-cols-2 xl:gap-10 2xl:gap-16 space-y-12 xl:space-y-0">
          {/* IT系 */}
          <div className="bg-white rounded-xl p-5 sm:p-6">
            <h3 className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-4 pb-3 border-b border-[var(--border)]">
              IT・情報処理系
            </h3>
            <CertTable certs={itCerts} />
          </div>
          {/* 電気・通信系 */}
          <div className="bg-white rounded-xl p-5 sm:p-6">
            <h3 className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-4 pb-3 border-b border-[var(--border)]">
              電気・通信系
            </h3>
            <CertTable certs={electricCerts} />
          </div>
        </div>
      </Section>

      {/* 技能・その他 */}
      <Section heading="Others">
        <div className="bg-[var(--page-bg)] rounded-xl p-5 sm:p-6 max-w-xl">
          <h3 className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-4 pb-3 border-b border-[var(--border)]">
            技能・その他
          </h3>
          <CertTable certs={otherCerts} />
        </div>
      </Section>

      {/* Note */}
      <Section heading="Note" bg="gray" last>
        <div className="max-w-2xl space-y-4">
          {[
            {
              label: "セキュリティ適性",
              body: "情報処理安全確保支援士と情報セキュリティマネジメントの両取得により、Webセキュリティ・インシデント対応・リスク管理への深い理解を示せる。",
            },
            {
              label: "ハードウェア知識",
              body: "電気通信主任技術者・第一級陸上無線技術士・工事担任者・第二種電気工事士が示すように、フルスタックを超えたハードからソフトまでの一貫した理解を持つ。",
            },
            {
              label: "取得時期",
              body: "全15資格を高校在学中に取得。自己学習能力と継続力の証明。",
            },
          ].map((note) => (
            <div key={note.label} className="bg-white rounded-xl p-5">
              <p className="text-xs font-bold text-[var(--ogangetext)] tracking-widest uppercase mb-2">{note.label}</p>
              <p className="text-sm text-black leading-7">{note.body}</p>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}
