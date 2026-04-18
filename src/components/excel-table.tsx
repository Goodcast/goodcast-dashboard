"use client";

import type { WeeklyData, MonthlyGoals, MonthlyManagement } from "@/lib/types";

interface Props {
  memberName: string;
  month: string;
  weeks: WeeklyData[];
  goals: MonthlyGoals;
  monthly: MonthlyManagement;
  onWeekChange: (weekIndex: number, data: WeeklyData) => void;
  onGoalsChange: (goals: MonthlyGoals) => void;
  onMonthlyChange: (monthly: MonthlyManagement) => void;
}

const weekLabels = ["1週目", "2週目", "3週目", "4週目", "5週目"];

export function ExcelTable({ memberName, month, weeks, goals, monthly, onWeekChange, onGoalsChange, onMonthlyChange }: Props) {
  const [y, m] = month.split("-");
  const monthLabel = `${parseInt(m)}`;

  // Calculate totals
  const totals = weeks.reduce(
    (acc, w) => ({
      newCompanies: acc.newCompanies + w.newCompanies,
      repeatCompanies: acc.repeatCompanies + w.repeatCompanies,
      newOrderPeople: acc.newOrderPeople + w.newOrderPeople,
      residentOrderPeople: acc.residentOrderPeople + w.residentOrderPeople,
      repeatPeople: acc.repeatPeople + w.repeatPeople,
      replaceOrderPeople: acc.replaceOrderPeople + w.replaceOrderPeople,
      totalOrders: acc.totalOrders + w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople,
      totalProspectCompanies: w.totalProspectCompanies || acc.totalProspectCompanies,
      totalProspectPeople: w.totalProspectPeople || acc.totalProspectPeople,
      newProspectCompanies: acc.newProspectCompanies + w.newProspectCompanies,
      newProspectPeople: acc.newProspectPeople + w.newProspectPeople,
      newApptDone: acc.newApptDone + w.newApptDone,
      reApptDone: acc.reApptDone + w.reApptDone,
      patrolCount: acc.patrolCount + w.patrolCount,
      newApptGained: acc.newApptGained + w.newApptGained,
      reApptGained: acc.reApptGained + w.reApptGained,
      callDuration: acc.callDuration + w.callDuration,
      callCount: acc.callCount + w.callCount,
      contactCount: acc.contactCount + w.contactCount,
      walkInCount: acc.walkInCount + w.walkInCount,
    }),
    {
      newCompanies: 0, repeatCompanies: 0, newOrderPeople: 0, residentOrderPeople: 0,
      repeatPeople: 0, replaceOrderPeople: 0, totalOrders: 0,
      totalProspectCompanies: 0, totalProspectPeople: 0,
      newProspectCompanies: 0, newProspectPeople: 0,
      newApptDone: 0, reApptDone: 0, patrolCount: 0,
      newApptGained: 0, reApptGained: 0,
      callDuration: 0, callCount: 0, contactCount: 0, walkInCount: 0,
    }
  );

  const pct = (a: number, b: number) => b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "—";
  const totalContactRate = pct(totals.contactCount, totals.callCount);
  const totalApptRate = pct(totals.newApptGained, totals.contactCount);

  const cell = "border border-gray-300 px-2 py-1.5 text-xs tabular-nums text-center";
  const headerCell = "border border-gray-400 px-1 py-1 text-[10px] font-bold text-center bg-yellow-100 whitespace-nowrap";
  const weekHeaderCell = "border border-gray-400 px-2 py-1 text-xs font-bold bg-yellow-300 text-center";
  const totalCell = "border border-gray-400 px-2 py-1.5 text-xs font-bold tabular-nums text-center bg-yellow-200";
  const inputCell = "border border-gray-300 px-0 py-0 text-center";

  function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full h-full px-1 py-1.5 text-xs text-center bg-transparent focus:outline-none focus:bg-blue-50 tabular-nums"
        placeholder="0"
      />
    );
  }

  function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-1 py-1 text-[10px] bg-transparent focus:outline-none focus:bg-blue-50 resize-none"
        rows={3}
        placeholder="【オーダー】&#10;【見込み】"
      />
    );
  }

  function weekRow(i: number) {
    const w = weeks[i];
    const update = (key: keyof WeeklyData, val: number | string) => {
      onWeekChange(i, { ...w, [key]: val });
    };
    const orderTotal = w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople;
    const prospectRate = pct(w.newProspectCompanies, w.totalProspectCompanies || 1);
    const contactRate = pct(w.contactCount, w.callCount);
    const apptRate = pct(w.newApptGained, w.contactCount);

    return (
      <tr key={i}>
        <td className={weekHeaderCell}>{weekLabels[i]}</td>
        <td className={inputCell}><NumInput value={w.newCompanies} onChange={(v) => update("newCompanies", v)} /></td>
        <td className={inputCell}><NumInput value={w.repeatCompanies} onChange={(v) => update("repeatCompanies", v)} /></td>
        <td className={inputCell}><NumInput value={w.newOrderPeople} onChange={(v) => update("newOrderPeople", v)} /></td>
        <td className={inputCell}><NumInput value={w.residentOrderPeople} onChange={(v) => update("residentOrderPeople", v)} /></td>
        <td className={inputCell}><NumInput value={w.repeatPeople} onChange={(v) => update("repeatPeople", v)} /></td>
        <td className={inputCell}><NumInput value={w.replaceOrderPeople} onChange={(v) => update("replaceOrderPeople", v)} /></td>
        <td className={`${cell} font-bold bg-gray-50`}>{orderTotal}</td>
        <td className={inputCell}><NumInput value={w.totalProspectCompanies} onChange={(v) => update("totalProspectCompanies", v)} /></td>
        <td className={inputCell}><NumInput value={w.totalProspectPeople} onChange={(v) => update("totalProspectPeople", v)} /></td>
        <td className={inputCell}><NumInput value={w.newProspectCompanies} onChange={(v) => update("newProspectCompanies", v)} /></td>
        <td className={inputCell}><NumInput value={w.newProspectPeople} onChange={(v) => update("newProspectPeople", v)} /></td>
        <td className={`${cell} bg-purple-50`}>{prospectRate}</td>
        <td className={inputCell}><NumInput value={w.newApptDone} onChange={(v) => update("newApptDone", v)} /></td>
        <td className={inputCell}><NumInput value={w.reApptDone} onChange={(v) => update("reApptDone", v)} /></td>
        <td className={inputCell}><NumInput value={w.patrolCount} onChange={(v) => update("patrolCount", v)} /></td>
        <td className={inputCell}><NumInput value={w.newApptGained} onChange={(v) => update("newApptGained", v)} /></td>
        <td className={inputCell}><NumInput value={w.reApptGained} onChange={(v) => update("reApptGained", v)} /></td>
        <td className={inputCell}><NumInput value={w.callDuration} onChange={(v) => update("callDuration", v)} /></td>
        <td className={inputCell}><NumInput value={w.callCount} onChange={(v) => update("callCount", v)} /></td>
        <td className={inputCell}><NumInput value={w.contactCount} onChange={(v) => update("contactCount", v)} /></td>
        <td className={`${cell} bg-green-50`}>{contactRate}</td>
        <td className={`${cell} bg-green-50`}>{apptRate}</td>
        <td className={inputCell}><NumInput value={w.walkInCount} onChange={(v) => update("walkInCount", v)} /></td>
        <td className={`${cell} bg-gray-50`}>{w.callCount > 0 ? `${(((w.callDuration + (w.newApptDone + w.reApptDone + w.patrolCount) * 1800 + w.walkInCount * 3600) / (8 * 3600 * 5)) * 100).toFixed(1)}%` : "0%"}</td>
        <td className={`${inputCell} min-w-[160px]`}><TextInput value={w.notes} onChange={(v) => update("notes", v)} /></td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-xl font-bold">{monthLabel} 月度</span>
        <span className="font-bold">ベトナムエンジニア週報</span>
        <span className="text-gray-500">名前：</span>
        <span className="font-bold text-lg">{memberName}</span>
        <span className="ml-auto text-gray-500">総稼働日数: <span className="font-bold text-black">18日</span></span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-gray-400 rounded">
        <table className="border-collapse text-xs w-max">
          <thead>
            <tr>
              <th className={headerCell}></th>
              <th className={headerCell}>新規<br/>企業数</th>
              <th className={headerCell}>リピート<br/>企業数</th>
              <th className={headerCell}>新規オー<br/>ダー人数</th>
              <th className={headerCell}>在日オー<br/>ダー人数</th>
              <th className={headerCell}>リピート<br/>人数</th>
              <th className={headerCell}>入替オー<br/>ダー人数</th>
              <th className={headerCell}>合計オー<br/>ダー人数</th>
              <th className={headerCell}>総見込み<br/>企業数</th>
              <th className={headerCell}>総見込み<br/>人数</th>
              <th className={headerCell}>新規見込<br/>み企業数</th>
              <th className={headerCell}>新規見込<br/>み人数</th>
              <th className={`${headerCell} bg-purple-100`}>見込み率</th>
              <th className={headerCell}>新規アポ<br/>消化</th>
              <th className={headerCell}>再アポ<br/>消化</th>
              <th className={headerCell}>巡回数</th>
              <th className={headerCell}>新規アポ<br/>獲得</th>
              <th className={headerCell}>再アポ<br/>獲得</th>
              <th className={headerCell}>架電時間<br/>(秒)</th>
              <th className={headerCell}>架電<br/>件数</th>
              <th className={headerCell}>着電<br/>件数</th>
              <th className={`${headerCell} bg-green-100`}>着電率</th>
              <th className={`${headerCell} bg-green-100`}>新規アポ<br/>獲得率</th>
              <th className={headerCell}>飛び込み<br/>件数</th>
              <th className={headerCell}>行動量%</th>
              <th className={`${headerCell} min-w-[160px]`}>備考</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => weekRow(i))}
            {/* Totals row */}
            <tr className="bg-yellow-200 font-bold">
              <td className={totalCell}>結果</td>
              <td className={totalCell}>{totals.newCompanies}</td>
              <td className={totalCell}>{totals.repeatCompanies}</td>
              <td className={totalCell}>{totals.newOrderPeople}</td>
              <td className={totalCell}>{totals.residentOrderPeople}</td>
              <td className={totalCell}>{totals.repeatPeople}</td>
              <td className={totalCell}>{totals.replaceOrderPeople}</td>
              <td className={totalCell}>{totals.totalOrders}</td>
              <td className={totalCell}>{totals.totalProspectCompanies}</td>
              <td className={totalCell}>{totals.totalProspectPeople}</td>
              <td className={totalCell}>{totals.newProspectCompanies}</td>
              <td className={totalCell}>{totals.newProspectPeople}</td>
              <td className={`${totalCell} bg-purple-100`}>{pct(totals.newProspectCompanies, totals.totalProspectCompanies || 1)}</td>
              <td className={totalCell}>{totals.newApptDone}</td>
              <td className={totalCell}>{totals.reApptDone}</td>
              <td className={totalCell}>{totals.patrolCount}</td>
              <td className={totalCell}>{totals.newApptGained}</td>
              <td className={totalCell}>{totals.reApptGained}</td>
              <td className={totalCell}>{totals.callDuration}</td>
              <td className={totalCell}>{totals.callCount}</td>
              <td className={totalCell}>{totals.contactCount}</td>
              <td className={`${totalCell} bg-green-100`}>{totalContactRate}</td>
              <td className={`${totalCell} bg-green-100`}>{totalApptRate}</td>
              <td className={totalCell}>{totals.walkInCount}</td>
              <td className={totalCell}></td>
              <td className={totalCell}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly Management Table */}
      <div>
        <h3 className="text-sm font-bold mb-2">▼ 月次管理（稼働数、退職・申請・入社）</h3>
        <div className="overflow-x-auto border border-gray-400 rounded">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className={headerCell}></th>
                <th className={headerCell}>担当<br/>企業数</th>
                <th className={headerCell}>担当<br/>稼働人数</th>
                <th className={headerCell}>今月<br/>入社人数</th>
                <th className={headerCell}>次月入社<br/>予定人数</th>
                <th className={headerCell}>申請済み<br/>人数</th>
                <th className={headerCell}>書類回収<br/>中企業数</th>
                <th className={headerCell}>退職確定<br/>人数</th>
                <th className={headerCell}>退職予定<br/>人数</th>
                <th className={headerCell}>入れ替え<br/>人数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={weekHeaderCell}>今月実績</td>
                <td className={inputCell}><NumInput value={monthly.managedCompanies} onChange={(v) => onMonthlyChange({ ...monthly, managedCompanies: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.activeWorkers} onChange={(v) => onMonthlyChange({ ...monthly, activeWorkers: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.newHires} onChange={(v) => onMonthlyChange({ ...monthly, newHires: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.nextMonthHires} onChange={(v) => onMonthlyChange({ ...monthly, nextMonthHires: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.applicants} onChange={(v) => onMonthlyChange({ ...monthly, applicants: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.docCollecting} onChange={(v) => onMonthlyChange({ ...monthly, docCollecting: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.confirmedResignations} onChange={(v) => onMonthlyChange({ ...monthly, confirmedResignations: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.plannedResignations} onChange={(v) => onMonthlyChange({ ...monthly, plannedResignations: v })} /></td>
                <td className={inputCell}><NumInput value={monthly.replacements} onChange={(v) => onMonthlyChange({ ...monthly, replacements: v })} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Target Table */}
      <div>
        <h3 className="text-sm font-bold mb-2">目標設定(KPI)</h3>
        <div className="overflow-x-auto border border-gray-400 rounded">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className={headerCell}></th>
                <th className={headerCell}>架電件数</th>
                <th className={headerCell}>新規アポ<br/>獲得</th>
                <th className={headerCell}>再アポ<br/>獲得</th>
                <th className={headerCell}>新規アポ<br/>消化</th>
                <th className={headerCell}>再アポ<br/>消化</th>
                <th className={headerCell}>オーダー<br/>人数</th>
                <th className={headerCell}>新規見込<br/>み企業数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={weekHeaderCell}>月目標</td>
                {[
                  { key: "callCount" as const, val: goals.callCount },
                  { key: "newApptGained" as const, val: goals.newApptGained },
                  { key: "reApptGained" as const, val: goals.reApptGained },
                  { key: "newApptDone" as const, val: goals.newApptDone },
                  { key: "reApptDone" as const, val: goals.reApptDone },
                  { key: "orderPeople" as const, val: goals.orderPeople },
                  { key: "newProspectCompanies" as const, val: goals.newProspectCompanies },
                ].map((f) => (
                  <td key={f.key} className={inputCell}>
                    <NumInput value={f.val} onChange={(v) => onGoalsChange({ ...goals, [f.key]: v })} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className={weekHeaderCell}>今月実績</td>
                <td className={cell}>{totals.callCount}</td>
                <td className={cell}>{totals.newApptGained}</td>
                <td className={cell}>{totals.reApptGained}</td>
                <td className={cell}>{totals.newApptDone}</td>
                <td className={cell}>{totals.reApptDone}</td>
                <td className={cell}>{totals.totalOrders}</td>
                <td className={cell}>{totals.newProspectCompanies}</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className={`${cell} font-bold bg-yellow-100`}>達成率</td>
                {[
                  { actual: totals.callCount, goal: goals.callCount },
                  { actual: totals.newApptGained, goal: goals.newApptGained },
                  { actual: totals.reApptGained, goal: goals.reApptGained },
                  { actual: totals.newApptDone, goal: goals.newApptDone },
                  { actual: totals.reApptDone, goal: goals.reApptDone },
                  { actual: totals.totalOrders, goal: goals.orderPeople },
                  { actual: totals.newProspectCompanies, goal: goals.newProspectCompanies },
                ].map((f, i) => {
                  const rate = f.goal > 0 ? (f.actual / f.goal) * 100 : 0;
                  const color = rate >= 100 ? "text-emerald-700 bg-emerald-50" : rate >= 60 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
                  return (
                    <td key={i} className={`${cell} font-bold ${color}`}>
                      {f.goal > 0 ? `${rate.toFixed(1)}%` : "—"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
