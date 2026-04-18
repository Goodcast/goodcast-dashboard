"use client";

import type { WeeklyData, MonthlyGoals } from "@/lib/types";

interface Props {
  goals: MonthlyGoals;
  weeks: WeeklyData[];
}

export function ProgressBars({ goals, weeks }: Props) {
  const totals = weeks.reduce(
    (acc, w) => ({
      callCount: acc.callCount + w.callCount,
      newApptGained: acc.newApptGained + w.newApptGained,
      newApptDone: acc.newApptDone + w.newApptDone,
      reApptDone: acc.reApptDone + w.reApptDone,
      reApptGained: acc.reApptGained + w.reApptGained,
      orderPeople: acc.orderPeople + w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople,
      newProspectCompanies: acc.newProspectCompanies + w.newProspectCompanies,
      contactCount: acc.contactCount + w.contactCount,
    }),
    { callCount: 0, newApptGained: 0, newApptDone: 0, reApptDone: 0, reApptGained: 0, orderPeople: 0, newProspectCompanies: 0, contactCount: 0 }
  );

  const contactRate = totals.callCount > 0 ? (totals.contactCount / totals.callCount) * 100 : 0;
  const apptRate = totals.contactCount > 0 ? (totals.newApptGained / totals.contactCount) * 100 : 0;
  const orderRate = (totals.newApptDone + totals.reApptDone) > 0
    ? (totals.orderPeople / (totals.newApptDone + totals.reApptDone)) * 100 : 0;

  const items: { label: string; actual: number; goal: number; unit: string }[] = [
    { label: "架電件数", actual: totals.callCount, goal: goals.callCount, unit: "件" },
    { label: "新規アポ獲得", actual: totals.newApptGained, goal: goals.newApptGained, unit: "件" },
    { label: "再アポ獲得", actual: totals.reApptGained, goal: goals.reApptGained, unit: "件" },
    { label: "新規アポ消化", actual: totals.newApptDone, goal: goals.newApptDone, unit: "件" },
    { label: "再アポ消化", actual: totals.reApptDone, goal: goals.reApptDone, unit: "件" },
    { label: "オーダー人数", actual: totals.orderPeople, goal: goals.orderPeople, unit: "名" },
    { label: "新規見込み企業", actual: totals.newProspectCompanies, goal: goals.newProspectCompanies, unit: "社" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <RateCard label="着電率" value={contactRate} />
        <RateCard label="着電→アポ率" value={apptRate} />
        <RateCard label="アポ→オーダー率" value={orderRate} />
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const pct = item.goal > 0 ? Math.min((item.actual / item.goal) * 100, 100) : 0;
          const pctDisplay = item.goal > 0 ? ((item.actual / item.goal) * 100).toFixed(1) : "—";
          const color = pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm tabular-nums">
                  <span className="font-semibold">{item.actual}</span>
                  <span className="text-gray-400"> / {item.goal}{item.unit}</span>
                  <span className={`ml-2 font-medium ${pct >= 100 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-500"}`}>
                    {pctDisplay}%
                  </span>
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: number }) {
  const color = value >= 20 ? "text-emerald-600" : value >= 10 ? "text-amber-600" : "text-red-500";
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value.toFixed(1)}%</p>
    </div>
  );
}
