"use client";

import type { MonthlyGoals } from "@/lib/types";

interface Props {
  goals: MonthlyGoals;
  onChange: (g: MonthlyGoals) => void;
}

const fields: { key: keyof MonthlyGoals; label: string }[] = [
  { key: "callCount", label: "架電件数" },
  { key: "newApptGained", label: "新規アポ獲得" },
  { key: "reApptGained", label: "再アポ獲得" },
  { key: "newApptDone", label: "新規アポ消化" },
  { key: "reApptDone", label: "再アポ消化" },
  { key: "orderPeople", label: "オーダー人数" },
  { key: "newProspectCompanies", label: "新規見込み企業数" },
];

export function GoalsForm({ goals, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">{f.label}</label>
          <input
            type="number"
            value={goals[f.key] || ""}
            onChange={(e) => onChange({ ...goals, [f.key]: Number(e.target.value) || 0 })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  );
}
