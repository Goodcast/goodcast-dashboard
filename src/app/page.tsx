import Link from "next/link";

const members = [
  { name: "岡村", phase: "収穫期", calls: 46, contacts: 25, contactRate: 54.3, apptGained: 9, apptDone: 21, orders: 13, companies: 22, activeWorkers: 56, newHires: 5, resignations: 2, prospects: 31, status: "green" as const },
  { name: "榊原", phase: "成長期", calls: 516, contacts: 109, contactRate: 21.1, apptGained: 5, apptDone: 12, orders: 3, companies: 12, activeWorkers: 31, newHires: 3, resignations: 0, prospects: 30, status: "yellow" as const },
  { name: "玉木", phase: "成長期", calls: 236, contacts: 46, contactRate: 19.5, apptGained: 8, apptDone: 12, orders: 4, companies: 10, activeWorkers: 26, newHires: 0, resignations: 0, prospects: 12, status: "green" as const },
  { name: "中野", phase: "成長期", calls: 408, contacts: 70, contactRate: 17.2, apptGained: 8, apptDone: 15, orders: 0, companies: 9, activeWorkers: 17, newHires: 2, resignations: 0, prospects: 22, status: "red" as const },
  { name: "田中", phase: "種まき期", calls: 1215, contacts: 182, contactRate: 15.0, apptGained: 16, apptDone: 14, orders: 0, companies: 0, activeWorkers: 0, newHires: 0, resignations: 0, prospects: 2, status: "yellow" as const },
  { name: "長尾", phase: "種まき期", calls: 1411, contacts: 276, contactRate: 19.6, apptGained: 9, apptDone: 9, orders: 0, companies: 6, activeWorkers: 10, newHires: 0, resignations: 0, prospects: 10, status: "yellow" as const },
  { name: "小川", phase: "種まき期", calls: 713, contacts: 166, contactRate: 23.3, apptGained: 14, apptDone: 2, orders: 0, companies: 0, activeWorkers: 0, newHires: 0, resignations: 0, prospects: 6, status: "yellow" as const },
  { name: "塩崎", phase: "種まき期", calls: 1110, contacts: 172, contactRate: 15.5, apptGained: 22, apptDone: 12, orders: 0, companies: 0, activeWorkers: 0, newHires: 0, resignations: 0, prospects: 18, status: "yellow" as const },
];

const statusIcon = { green: "🟢", yellow: "🟡", red: "🔴" };
const phaseColor: Record<string, string> = {
  "収穫期": "bg-blue-100 text-blue-800",
  "成長期": "bg-amber-100 text-amber-800",
  "種まき期": "bg-green-100 text-green-800",
};

export default function Home() {
  const totalWorkers = members.reduce((s, m) => s + m.activeWorkers, 0);
  const totalOrders = members.reduce((s, m) => s + m.orders, 0);
  const totalCalls = members.reduce((s, m) => s + m.calls, 0);
  const totalProspects = members.reduce((s, m) => s + m.prospects, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">グッドキャスト 営業成績ダッシュボード</h1>
            <p className="text-sm text-gray-500">エンジニア派遣事業部 | 2026年4月度（第3週時点）</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="総稼働人数" value={totalWorkers} unit="名" color="indigo" />
          <SummaryCard label="今月オーダー" value={totalOrders} unit="名" color="emerald" />
          <SummaryCard label="総架電数" value={totalCalls.toLocaleString()} unit="件" color="amber" />
          <SummaryCard label="見込みパイプライン" value={totalProspects} unit="名" color="purple" />
        </div>

        {/* Team Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">チーム一覧</h2>
            <p className="text-xs text-gray-400 mt-1">名前をクリックで個人詳細ページへ</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3 font-medium">状態</th>
                  <th className="px-4 py-3 font-medium">名前</th>
                  <th className="px-4 py-3 font-medium">フェーズ</th>
                  <th className="px-4 py-3 font-medium text-right">架電数</th>
                  <th className="px-4 py-3 font-medium text-right">着電率</th>
                  <th className="px-4 py-3 font-medium text-right">アポ獲得</th>
                  <th className="px-4 py-3 font-medium text-right">アポ消化</th>
                  <th className="px-4 py-3 font-medium text-right">オーダー</th>
                  <th className="px-4 py-3 font-medium text-right">着電→アポ率</th>
                  <th className="px-4 py-3 font-medium text-right">アポ→オーダー率</th>
                  <th className="px-4 py-3 font-medium text-right">担当企業</th>
                  <th className="px-4 py-3 font-medium text-right">稼働人数</th>
                  <th className="px-4 py-3 font-medium text-right">見込み</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const apptRate = m.contacts > 0 ? ((m.apptGained / m.contacts) * 100).toFixed(1) : "0";
                  const orderRate = m.apptDone > 0 ? ((m.orders / m.apptDone) * 100).toFixed(1) : "0";
                  return (
                    <tr key={m.name} className="border-t border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 text-center">{statusIcon[m.status]}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/member/${encodeURIComponent(m.name)}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${phaseColor[m.phase]}`}>{m.phase}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.calls.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.contactRate}%</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.apptGained}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.apptDone}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold tabular-nums ${m.orders > 0 ? "text-emerald-600" : "text-gray-400"}`}>{m.orders}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={Number(apptRate) >= 10 ? "text-emerald-600" : "text-red-500"}>{apptRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={Number(orderRate) >= 20 ? "text-emerald-600" : "text-red-500"}>{orderRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.companies}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{m.activeWorkers}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.prospects}名</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-gray-900">合計</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">{totalCalls.toLocaleString()}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">{members.reduce((s, m) => s + m.apptGained, 0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{members.reduce((s, m) => s + m.apptDone, 0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{totalOrders}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">{members.reduce((s, m) => s + m.companies, 0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totalWorkers}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totalProspects}名</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h2 className="text-lg font-semibold text-gray-900">AI分析サジェスト</h2>
            <span className="text-xs text-gray-400 ml-2">4月 第3週</span>
          </div>
          <div className="divide-y divide-gray-100">
            <Suggestion name="岡村" status="green" title="成果◎ ただし新規開拓停滞リスク" body="オーダー13名で月目標超過。既存深耕が機能している。一方、架電46件・新規アポ獲得2件のみ。新規パイプラインが枯渇すると半年後に影響。週1件は新規アポを入れるルール検討を。" />
            <Suggestion name="田中" status="yellow" title="行動量◎ 商談力の強化が必要" body="架電1,215件で行動量は十分。1通話75.5秒と短く、アポ→オーダー転換率0%。アポは14件獲得できているが消化も14件でオーダーに繋がっていない。岡村の商談同行を推奨。" />
            <Suggestion name="中野" status="red" title="見込み22名がオーダーに転換できていない" body="アポ消化15件でオーダー0。見込み企業は22名分あるが停滞中。提案書の質・タイミング、またはクロージング力に課題の可能性。見込みA以上の企業への提案書を上司と一緒に作成すべき。" />
            <Suggestion name="塩崎" status="green" title="アポ獲得数チーム最多 消化ペースの改善を" body="アポ獲得22件はチーム最多で種まきは順調。ただし消化率55%（12/22件）。獲得ペースに消化が追いついていない。来週はアポ消化を優先し、新規架電を一旦抑えてOK。" />
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}<span className="text-sm font-normal ml-1">{unit}</span></p>
    </div>
  );
}

function Suggestion({ name, status, title, body }: { name: string; status: "green" | "yellow" | "red"; title: string; body: string }) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{statusIcon[status]}</span>
        <Link href={`/member/${encodeURIComponent(name)}`} className="font-semibold text-indigo-600 hover:underline">{name}</Link>
        <span className="text-gray-600">— {title}</span>
      </div>
      <p className="text-sm text-gray-600 ml-7">{body}</p>
    </div>
  );
}
