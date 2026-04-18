"use client";

import type { WeeklyData } from "@/lib/types";

interface Props {
  data: WeeklyData;
  onChange: (data: WeeklyData) => void;
}

const fields: { key: keyof WeeklyData; label: string; group: string }[] = [
  { key: "newCompanies", label: "新規企業数", group: "成果" },
  { key: "repeatCompanies", label: "リピート企業数", group: "成果" },
  { key: "newOrderPeople", label: "新規オーダー人数", group: "成果" },
  { key: "residentOrderPeople", label: "在日オーダー人数", group: "成果" },
  { key: "repeatPeople", label: "リピート人数", group: "成果" },
  { key: "replaceOrderPeople", label: "入替オーダー人数", group: "成果" },
  { key: "callCount", label: "架電件数", group: "テレアポ" },
  { key: "callDuration", label: "架電時間(秒)", group: "テレアポ" },
  { key: "contactCount", label: "着電件数", group: "テレアポ" },
  { key: "newApptGained", label: "新規アポ獲得", group: "アポ" },
  { key: "reApptGained", label: "再アポ獲得", group: "アポ" },
  { key: "newApptDone", label: "新規アポ消化", group: "アポ" },
  { key: "reApptDone", label: "再アポ消化", group: "アポ" },
  { key: "patrolCount", label: "巡回数", group: "アポ" },
  { key: "walkInCount", label: "飛び込み件数", group: "アポ" },
  { key: "totalProspectCompanies", label: "総見込み企業数", group: "見込み" },
  { key: "totalProspectPeople", label: "総見込み人数", group: "見込み" },
  { key: "newProspectCompanies", label: "新規見込み企業数", group: "見込み" },
  { key: "newProspectPeople", label: "新規見込み人数", group: "見込み" },
];

export function WeeklyForm({ data, onChange }: Props) {
  const groups = [...new Set(fields.map((f) => f.group))];

  const handleChange = (key: keyof WeeklyData, value: string) => {
    if (key === "notes") {
      onChange({ ...data, notes: value });
    } else {
      onChange({ ...data, [key]: Number(value) || 0 });
    }
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 px-1">{group}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {fields
              .filter((f) => f.group === group)
              .map((f) => (
                <div key={f.key} className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type="number"
                    value={data[f.key] || ""}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="0"
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 px-1">備考</h4>
        <textarea
          value={data.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          rows={3}
          placeholder="【オーダー】&#10;【見込み】"
        />
      </div>
    </div>
  );
}
