"use client";

import type { MonthlyManagement } from "@/lib/types";

interface Props {
  data: MonthlyManagement;
  onChange: (d: MonthlyManagement) => void;
}

const fields: { key: keyof MonthlyManagement; label: string }[] = [
  { key: "managedCompanies", label: "担当企業数" },
  { key: "activeWorkers", label: "担当稼働人数" },
  { key: "newHires", label: "今月入社人数" },
  { key: "nextMonthHires", label: "次月入社予定人数" },
  { key: "applicants", label: "申請済み人数" },
  { key: "docCollecting", label: "書類回収中企業数" },
  { key: "confirmedResignations", label: "退職確定人数" },
  { key: "plannedResignations", label: "退職予定人数" },
  { key: "replacements", label: "入れ替え人数" },
];

export function MonthlyManagementForm({ data, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">{f.label}</label>
          <input
            type="number"
            value={data[f.key] || ""}
            onChange={(e) => onChange({ ...data, [f.key]: Number(e.target.value) || 0 })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  );
}
