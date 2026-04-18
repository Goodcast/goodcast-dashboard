"use client";

import type { WeeklyData, MonthlyGoals, MonthlyManagement } from "@/lib/types";
import { getMonthWeeks, getTotalWorkdays, calcActionRate } from "@/lib/workdays";

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
  const [, m] = month.split("-");
  const monthLabel = `${parseInt(m)}`;
  const weekInfos = getMonthWeeks(month);
  const totalWorkdays = getTotalWorkdays(month);

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

  const cell = "border border-gray-300 px-2 py-1.5 text-xs tabular-nums text-center";
  const hCell = "border border-gray-400 px-1 py-1 text-[10px] font-bold text-center bg-yellow-100 whitespace-nowrap";
  const wCell = "border border-gray-400 px-2 py-1 text-xs font-bold bg-yellow-300 text-center whitespace-nowrap";
  const tCell = "border border-gray-400 px-2 py-1.5 text-xs font-bold tabular-nums text-center bg-yellow-200";
  const iCell = "border border-gray-300 px-0 py-0 text-center";

  function NI({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-[50px] h-full px-0.5 py-1.5 text-xs text-center bg-transparent focus:outline-none focus:bg-blue-50 tabular-nums"
        placeholder="0"
      />
    );
  }

  function weekRow(i: number) {
    const w = weeks[i];
    const wi = weekInfos[i];
    const update = (key: keyof WeeklyData, val: number | string) => {
      onWeekChange(i, { ...w, [key]: val });
    };
    const orderTotal = w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople;
    const apptTotal = w.newApptDone + w.reApptDone + w.patrolCount;
    const contactRate = pct(w.contactCount, w.callCount);
    const apptFromCallRate = pct(w.newApptGained, w.callCount);
    const apptFromContactRate = pct(w.newApptGained, w.contactCount);
    const prospectRate = pct(w.newProspectCompanies, w.totalProspectCompanies || 1);

    // 行動量% = (アポ数 / (稼働日×3)) + (架電秒数 / (稼働日×7500))
    const actionRate = calcActionRate(apptTotal, w.callDuration, wi.workdays);

    // Auto note: combine auto-generated + user notes
    const autoNote = wi.autoNote;
    const displayNote = autoNote
      ? (w.notes ? `${autoNote}\n${w.notes}` : autoNote)
      : w.notes;

    return (
      <tr key={i}>
        <td className={wCell}>{weekLabels[i]}</td>
        <td className={iCell}><NI value={w.newCompanies} onChange={(v) => update("newCompanies", v)} /></td>
        <td className={iCell}><NI value={w.repeatCompanies} onChange={(v) => update("repeatCompanies", v)} /></td>
        <td className={iCell}><NI value={w.newOrderPeople} onChange={(v) => update("newOrderPeople", v)} /></td>
        <td className={iCell}><NI value={w.residentOrderPeople} onChange={(v) => update("residentOrderPeople", v)} /></td>
        <td className={iCell}><NI value={w.repeatPeople} onChange={(v) => update("repeatPeople", v)} /></td>
        <td className={iCell}><NI value={w.replaceOrderPeople} onChange={(v) => update("replaceOrderPeople", v)} /></td>
        <td className={`${cell} font-bold bg-gray-50`}>{orderTotal}</td>
        <td className={iCell}><NI value={w.totalProspectCompanies} onChange={(v) => update("totalProspectCompanies", v)} /></td>
        <td className={iCell}><NI value={w.totalProspectPeople} onChange={(v) => update("totalProspectPeople", v)} /></td>
        <td className={iCell}><NI value={w.newProspectCompanies} onChange={(v) => update("newProspectCompanies", v)} /></td>
        <td className={iCell}><NI value={w.newProspectPeople} onChange={(v) => update("newProspectPeople", v)} /></td>
        <td className={`${cell} bg-purple-50`}>{prospectRate}</td>
        <td className={iCell}><NI value={w.newApptDone} onChange={(v) => update("newApptDone", v)} /></td>
        <td className={iCell}><NI value={w.reApptDone} onChange={(v) => update("reApptDone", v)} /></td>
        <td className={iCell}><NI value={w.patrolCount} onChange={(v) => update("patrolCount", v)} /></td>
        <td className={iCell}><NI value={w.newApptGained} onChange={(v) => update("newApptGained", v)} /></td>
        <td className={iCell}><NI value={w.reApptGained} onChange={(v) => update("reApptGained", v)} /></td>
        <td className={iCell}><NI value={w.callDuration} onChange={(v) => update("callDuration", v)} /></td>
        <td className={iCell}><NI value={w.callCount} onChange={(v) => update("callCount", v)} /></td>
        <td className={iCell}><NI value={w.contactCount} onChange={(v) => update("contactCount", v)} /></td>
        <td className={`${cell} bg-green-50`}>{contactRate}</td>
        <td className={`${cell} bg-green-50`}>{apptFromContactRate}</td>
        <td className={iCell}><NI value={w.walkInCount} onChange={(v) => update("walkInCount", v)} /></td>
        <td className={`${cell} ${actionRate >= 100 ? "bg-emerald-100 text-emerald-800 font-bold" : actionRate >= 60 ? "bg-amber-50" : "bg-red-50 text-red-700"}`}>
          {actionRate > 0 ? `${actionRate.toFixed(1)}%` : "0%"}
        </td>
        <td className={`${iCell} min-w-[180px]`}>
          <textarea
            value={displayNote}
            onChange={(e) => {
              // Strip auto-note prefix if user edits
              const val = autoNote && e.target.value.startsWith(autoNote)
                ? e.target.value.slice(autoNote.length).replace(/^\n/, "")
                : e.target.value;
              update("notes", val);
            }}
            className="w-full h-full px-1 py-1 text-[10px] bg-transparent focus:outline-none focus:bg-blue-50 resize-none"
            rows={3}
          />
        </td>
      </tr>
    );
  }

  // Total action rate
  const totalApptCount = totals.newApptDone + totals.reApptDone + totals.patrolCount;
  const totalActionRate = calcActionRate(totalApptCount, totals.callDuration, totalWorkdays);

  // Auto-calculated rates for totals
  const totalContactRate = pct(totals.contactCount, totals.callCount);
  const totalApptFromContactRate = pct(totals.newApptGained, totals.contactCount);
  const avgCallTime = totals.callCount > 0 ? (totals.callDuration / totals.callCount).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="text-xl font-bold">{monthLabel} 月度</span>
        <span className="font-bold">ベトナムエンジニア週報</span>
        <span className="text-gray-500">名前：</span>
        <span className="font-bold text-lg">{memberName}</span>
        <span className="ml-auto text-gray-500">
          総稼働日数: <span className="font-bold text-black">{totalWorkdays}日</span>
        </span>
      </div>

      {/* Week date ranges */}
      <div className="flex gap-4 text-[10px] text-gray-500">
        <span className="font-bold">稼働日計算</span>
        {weekInfos.map((wi, i) => (
          <span key={i}>
            {weekLabels[i]}: {wi.workdays}日
            {wi.holidays.length > 0 && <span className="text-red-500 ml-1">(祝{wi.holidays.length})</span>}
          </span>
        ))}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-gray-400 rounded">
        <table className="border-collapse text-xs w-max">
          <thead>
            <tr>
              <th className={hCell}></th>
              <th className={hCell}>新規<br/>企業数</th>
              <th className={hCell}>リピート<br/>企業数</th>
              <th className={hCell}>新規オー<br/>ダー人数</th>
              <th className={hCell}>在日オー<br/>ダー人数</th>
              <th className={hCell}>リピート<br/>人数</th>
              <th className={hCell}>入替オー<br/>ダー人数</th>
              <th className={hCell}>合計オー<br/>ダー人数</th>
              <th className={hCell}>総見込み<br/>企業数</th>
              <th className={hCell}>総見込み<br/>人数</th>
              <th className={hCell}>新規見込<br/>み企業数</th>
              <th className={hCell}>新規見込<br/>み人数</th>
              <th className={`${hCell} bg-purple-100`}>見込み率</th>
              <th className={hCell}>新規アポ<br/>消化</th>
              <th className={hCell}>再アポ<br/>消化</th>
              <th className={hCell}>巡回数</th>
              <th className={hCell}>新規アポ<br/>獲得</th>
              <th className={hCell}>再アポ<br/>獲得</th>
              <th className={hCell}>架電時間<br/>(秒)</th>
              <th className={hCell}>架電<br/>件数</th>
              <th className={hCell}>着電<br/>件数</th>
              <th className={`${hCell} bg-green-100`}>着電率</th>
              <th className={`${hCell} bg-green-100`}>新規アポ<br/>獲得率</th>
              <th className={hCell}>飛び込み<br/>件数</th>
              <th className={hCell}>行動量%</th>
              <th className={`${hCell} min-w-[180px]`}>備考</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => weekRow(i))}
            <tr className="bg-yellow-200 font-bold">
              <td className={tCell}>結果</td>
              <td className={tCell}>{totals.newCompanies}</td>
              <td className={tCell}>{totals.repeatCompanies}</td>
              <td className={tCell}>{totals.newOrderPeople}</td>
              <td className={tCell}>{totals.residentOrderPeople}</td>
              <td className={tCell}>{totals.repeatPeople}</td>
              <td className={tCell}>{totals.replaceOrderPeople}</td>
              <td className={tCell}>{totals.totalOrders}</td>
              <td className={tCell}>{totals.totalProspectCompanies}</td>
              <td className={tCell}>{totals.totalProspectPeople}</td>
              <td className={tCell}>{totals.newProspectCompanies}</td>
              <td className={tCell}>{totals.newProspectPeople}</td>
              <td className={`${tCell} bg-purple-100`}>{pct(totals.newProspectCompanies, totals.totalProspectCompanies || 1)}</td>
              <td className={tCell}>{totals.newApptDone}</td>
              <td className={tCell}>{totals.reApptDone}</td>
              <td className={tCell}>{totals.patrolCount}</td>
              <td className={tCell}>{totals.newApptGained}</td>
              <td className={tCell}>{totals.reApptGained}</td>
              <td className={tCell}>{totals.callDuration}</td>
              <td className={tCell}>{totals.callCount}</td>
              <td className={tCell}>{totals.contactCount}</td>
              <td className={`${tCell} bg-green-100`}>{totalContactRate}</td>
              <td className={`${tCell} bg-green-100`}>{totalApptFromContactRate}</td>
              <td className={tCell}>{totals.walkInCount}</td>
              <td className={`${tCell} ${totalActionRate >= 100 ? "bg-emerald-200" : ""}`}>{totalActionRate.toFixed(1)}%</td>
              <td className={tCell}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Auto-calculated KPIs */}
      <div>
        <h3 className="text-sm font-bold mb-2">📊 自動計測KPI</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KPICard label="着電率" value={totalContactRate} sub={`${totals.contactCount}/${totals.callCount}件`} />
          <KPICard label="架電→アポ率" value={pct(totals.newApptGained, totals.callCount)} sub={`${totals.newApptGained}/${totals.callCount}件`} />
          <KPICard label="着電→アポ率" value={totalApptFromContactRate} sub={`${totals.newApptGained}/${totals.contactCount}件`} />
          <KPICard label="アポ→オーダー率" value={pct(totals.totalOrders, totals.newApptDone + totals.reApptDone)} sub={`${totals.totalOrders}/${totals.newApptDone + totals.reApptDone}件`} />
          <KPICard label="1通話平均秒数" value={`${avgCallTime}秒`} sub={`${totals.callDuration}秒/${totals.callCount}件`} />
          <KPICard label="アポ消化率" value={pct(totals.newApptDone + totals.reApptDone, totals.newApptGained + totals.reApptGained)} sub={`消化${totals.newApptDone + totals.reApptDone}/獲得${totals.newApptGained + totals.reApptGained}`} />
          <KPICard label="1オーダーあたり架電数" value={totals.totalOrders > 0 ? `${(totals.callCount / totals.totalOrders).toFixed(1)}件` : "—"} sub={`${totals.callCount}件/${totals.totalOrders}オーダー`} />
          <KPICard label="行動量%" value={`${totalActionRate.toFixed(1)}%`} sub={`アポ${totalApptCount}件+架電${totals.callDuration}秒`} />
        </div>
      </div>

      {/* Monthly Management Table */}
      <div>
        <h3 className="text-sm font-bold mb-2">▼ 月次管理（稼働数、退職・申請・入社）</h3>
        <div className="overflow-x-auto border border-gray-400 rounded">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className={hCell}></th>
                <th className={hCell}>担当<br/>企業数</th>
                <th className={hCell}>担当<br/>稼働人数</th>
                <th className={hCell}>今月<br/>入社人数</th>
                <th className={hCell}>次月入社<br/>予定人数</th>
                <th className={hCell}>申請済み<br/>人数</th>
                <th className={hCell}>書類回収<br/>中企業数</th>
                <th className={hCell}>退職確定<br/>人数</th>
                <th className={hCell}>退職予定<br/>人数</th>
                <th className={hCell}>入れ替え<br/>人数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={wCell}>今月実績</td>
                <td className={iCell}><NI value={monthly.managedCompanies} onChange={(v) => onMonthlyChange({ ...monthly, managedCompanies: v })} /></td>
                <td className={iCell}><NI value={monthly.activeWorkers} onChange={(v) => onMonthlyChange({ ...monthly, activeWorkers: v })} /></td>
                <td className={iCell}><NI value={monthly.newHires} onChange={(v) => onMonthlyChange({ ...monthly, newHires: v })} /></td>
                <td className={iCell}><NI value={monthly.nextMonthHires} onChange={(v) => onMonthlyChange({ ...monthly, nextMonthHires: v })} /></td>
                <td className={iCell}><NI value={monthly.applicants} onChange={(v) => onMonthlyChange({ ...monthly, applicants: v })} /></td>
                <td className={iCell}><NI value={monthly.docCollecting} onChange={(v) => onMonthlyChange({ ...monthly, docCollecting: v })} /></td>
                <td className={iCell}><NI value={monthly.confirmedResignations} onChange={(v) => onMonthlyChange({ ...monthly, confirmedResignations: v })} /></td>
                <td className={iCell}><NI value={monthly.plannedResignations} onChange={(v) => onMonthlyChange({ ...monthly, plannedResignations: v })} /></td>
                <td className={iCell}><NI value={monthly.replacements} onChange={(v) => onMonthlyChange({ ...monthly, replacements: v })} /></td>
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
                <th className={hCell}></th>
                <th className={hCell}>架電件数</th>
                <th className={hCell}>新規アポ<br/>獲得</th>
                <th className={hCell}>再アポ<br/>獲得</th>
                <th className={hCell}>新規アポ<br/>消化</th>
                <th className={hCell}>再アポ<br/>消化</th>
                <th className={hCell}>オーダー<br/>人数</th>
                <th className={hCell}>新規見込<br/>み企業数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={wCell}>月目標</td>
                {([
                  ["callCount", goals.callCount],
                  ["newApptGained", goals.newApptGained],
                  ["reApptGained", goals.reApptGained],
                  ["newApptDone", goals.newApptDone],
                  ["reApptDone", goals.reApptDone],
                  ["orderPeople", goals.orderPeople],
                  ["newProspectCompanies", goals.newProspectCompanies],
                ] as [keyof MonthlyGoals, number][]).map(([key, val]) => (
                  <td key={key} className={iCell}>
                    <NI value={val} onChange={(v) => onGoalsChange({ ...goals, [key]: v })} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className={wCell}>今月実績</td>
                <td className={cell}>{totals.callCount}</td>
                <td className={cell}>{totals.newApptGained}</td>
                <td className={cell}>{totals.reApptGained}</td>
                <td className={cell}>{totals.newApptDone}</td>
                <td className={cell}>{totals.reApptDone}</td>
                <td className={cell}>{totals.totalOrders}</td>
                <td className={cell}>{totals.newProspectCompanies}</td>
              </tr>
              <tr>
                <td className={`${cell} font-bold bg-yellow-100`}>達成率</td>
                {[
                  [totals.callCount, goals.callCount],
                  [totals.newApptGained, goals.newApptGained],
                  [totals.reApptGained, goals.reApptGained],
                  [totals.newApptDone, goals.newApptDone],
                  [totals.reApptDone, goals.reApptDone],
                  [totals.totalOrders, goals.orderPeople],
                  [totals.newProspectCompanies, goals.newProspectCompanies],
                ].map(([actual, goal], i) => {
                  const rate = goal > 0 ? (actual / goal) * 100 : 0;
                  const color = rate >= 100 ? "text-emerald-700 bg-emerald-50" : rate >= 60 ? "text-amber-700 bg-amber-50" : goal > 0 ? "text-red-700 bg-red-50" : "";
                  return (
                    <td key={i} className={`${cell} font-bold ${color}`}>
                      {goal > 0 ? `${rate.toFixed(1)}%` : "—"}
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

function KPICard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
      <p className="text-[10px] text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400 tabular-nums">{sub}</p>
    </div>
  );
}
